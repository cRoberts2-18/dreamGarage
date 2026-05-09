package api

import (
	"dream_grarage_api/db"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateTradeInput struct {
	UserId           int   `json:"userId"`
	RecipientId      int   `json:"recipientId"`
	OfferedCardIds   []int `json:"offeredCardIds"`
	RequestedCardIds []int `json:"requestedCardIds"`
}

type TradeActionInput struct {
	UserId int `json:"userId"`
}

type CounterTradeInput struct {
	UserId              int   `json:"userId"`
	NewOfferedCardIds   []int `json:"newOfferedCardIds"`
	NewRequestedCardIds []int `json:"newRequestedCardIds"`
}

type CardOwnership struct {
	UserCardId int
	CardId     int
}

type TradeItemDetail struct {
	UserCardId      *int   `json:"userCardId" db:"user_card_id"`
	CardId          int    `json:"cardId" db:"card_id"`
	Name            string `json:"name" db:"name"`
	Image           string `json:"image" db:"image"`
	Rating          string `json:"rating" db:"rating"`
	OfferedByUserId int    `json:"offeredByUserId" db:"offered_by_user_id"`
}

type TradeDetail struct {
	Id                int               `json:"id"`
	Status            string            `json:"status"`
	InitiatorId       int               `json:"initiatorId"`
	InitiatorUsername string            `json:"initiatorUsername"`
	RecipientId       int               `json:"recipientId"`
	RecipientUsername string            `json:"recipientUsername"`
	PendingUserId     int               `json:"pendingUserId"`
	InitiatorCards    []TradeItemDetail `json:"initiatorCards"`
	RecipientCards    []TradeItemDetail `json:"recipientCards"`
	CreatedAt         time.Time         `json:"createdAt"`
	UpdatedAt         time.Time         `json:"updatedAt"`
}

func validateCardOwnership(userId int, cardIds []int) ([]CardOwnership, error) {
	if len(cardIds) == 0 {
		return []CardOwnership{}, nil
	}
	result := make([]CardOwnership, 0, len(cardIds))
	for _, cardId := range cardIds {
		var ucId int
		err := db.Conn.QueryRowx(
			`SELECT id FROM user_cards WHERE user_id=$1 AND card_id=$2 LIMIT 1`,
			userId, cardId).Scan(&ucId)
		if err != nil {
			return nil, fmt.Errorf("one or more cards not owned")
		}
		result = append(result, CardOwnership{UserCardId: ucId, CardId: cardId})
	}
	return result, nil
}

func fetchTradeItems(tradeId int) ([]TradeItemDetail, error) {
	rows, err := db.Conn.Queryx(`
		SELECT ti.offered_by_user_id, ti.card_id, c.name, c.image, c.rating, ti.user_card_id
		FROM trade_items ti
		JOIN cards c ON c.id = ti.card_id
		WHERE ti.trade_id = $1`, tradeId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []TradeItemDetail{}
	for rows.Next() {
		var item TradeItemDetail
		if err := rows.StructScan(&item); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func buildTradeDetails(rows interface{ Next() bool; StructScan(interface{}) error; Close() error }) ([]TradeDetail, error) {
	type tradeRow struct {
		Id                int       `db:"id"`
		Status            string    `db:"status"`
		InitiatorId       int       `db:"initiator_id"`
		InitiatorUsername string    `db:"initiator_username"`
		RecipientId       int       `db:"recipient_id"`
		RecipientUsername string    `db:"recipient_username"`
		PendingUserId     int       `db:"pending_user_id"`
		CreatedAt         time.Time `db:"created_at"`
		UpdatedAt         time.Time `db:"updated_at"`
	}

	trades := []TradeDetail{}
	for rows.Next() {
		var row tradeRow
		if err := rows.StructScan(&row); err != nil {
			continue
		}

		items, err := fetchTradeItems(row.Id)
		if err != nil {
			continue
		}

		initiatorCards := []TradeItemDetail{}
		recipientCards := []TradeItemDetail{}
		for _, item := range items {
			if item.OfferedByUserId == row.InitiatorId {
				initiatorCards = append(initiatorCards, item)
			} else {
				recipientCards = append(recipientCards, item)
			}
		}

		trades = append(trades, TradeDetail{
			Id:                row.Id,
			Status:            row.Status,
			InitiatorId:       row.InitiatorId,
			InitiatorUsername: row.InitiatorUsername,
			RecipientId:       row.RecipientId,
			RecipientUsername: row.RecipientUsername,
			PendingUserId:     row.PendingUserId,
			InitiatorCards:    initiatorCards,
			RecipientCards:    recipientCards,
			CreatedAt:         row.CreatedAt,
			UpdatedAt:         row.UpdatedAt,
		})
	}
	return trades, nil
}

func CreateTrade(c *gin.Context) {
	var input CreateTradeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	if len(input.OfferedCardIds)+len(input.RequestedCardIds) == 0 {
		ResponseJSON(c, http.StatusBadRequest, "Trade must include at least one card", nil)
		return
	}
	if len(input.OfferedCardIds) > 5 || len(input.RequestedCardIds) > 5 {
		ResponseJSON(c, http.StatusBadRequest, "Maximum 5 cards per side", nil)
		return
	}

	var friendshipCount int
	err := db.Conn.QueryRowx(`
		SELECT COUNT(*) FROM friendships
		WHERE ((requester_id=$1 AND addressee_id=$2) OR (requester_id=$2 AND addressee_id=$1))
		AND status='accepted'`,
		input.UserId, input.RecipientId).Scan(&friendshipCount)
	if err != nil || friendshipCount == 0 {
		ResponseJSON(c, http.StatusForbidden, "You must be friends to trade", nil)
		return
	}

	var activeTrades int
	err = db.Conn.QueryRowx(`
		SELECT COUNT(*) FROM trades
		WHERE ((initiator_id=$1 AND recipient_id=$2) OR (initiator_id=$2 AND recipient_id=$1))
		AND status='pending'`,
		input.UserId, input.RecipientId).Scan(&activeTrades)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not check existing trades", nil)
		return
	}
	if activeTrades > 0 {
		ResponseJSON(c, http.StatusConflict, "An active trade already exists with this friend", nil)
		return
	}

	offeredOwnership, err := validateCardOwnership(input.UserId, input.OfferedCardIds)
	if err != nil {
		ResponseJSON(c, http.StatusBadRequest, "You do not own one or more offered cards", nil)
		return
	}

	requestedOwnership, err := validateCardOwnership(input.RecipientId, input.RequestedCardIds)
	if err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Friend does not own one or more requested cards", nil)
		return
	}

	var tradeId int
	err = db.Conn.QueryRowx(`
		INSERT INTO trades (initiator_id, recipient_id, status, pending_user_id)
		VALUES ($1, $2, 'pending', $2) RETURNING id`,
		input.UserId, input.RecipientId).Scan(&tradeId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not create trade", nil)
		return
	}

	for _, oc := range offeredOwnership {
		_, err = db.Conn.Exec(
			`INSERT INTO trade_items (trade_id, user_card_id, offered_by_user_id, card_id) VALUES ($1, $2, $3, $4)`,
			tradeId, oc.UserCardId, input.UserId, oc.CardId)
		if err != nil {
			ResponseJSON(c, http.StatusInternalServerError, "Could not create trade items", nil)
			return
		}
	}
	for _, rc := range requestedOwnership {
		_, err = db.Conn.Exec(
			`INSERT INTO trade_items (trade_id, user_card_id, offered_by_user_id, card_id) VALUES ($1, $2, $3, $4)`,
			tradeId, rc.UserCardId, input.RecipientId, rc.CardId)
		if err != nil {
			ResponseJSON(c, http.StatusInternalServerError, "Could not create trade items", nil)
			return
		}
	}

	ResponseJSON(c, http.StatusOK, "Trade created", gin.H{"tradeId": tradeId})
}

func GetActiveTrades(c *gin.Context) {
	var input TradeActionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	rows, err := db.Conn.Queryx(`
		SELECT t.id, t.status, t.initiator_id, ui.username as initiator_username,
			t.recipient_id, ur.username as recipient_username, t.pending_user_id,
			t.created_at, t.updated_at
		FROM trades t
		JOIN users ui ON ui.id = t.initiator_id
		JOIN users ur ON ur.id = t.recipient_id
		WHERE (t.initiator_id=$1 OR t.recipient_id=$1) AND t.status='pending'
		ORDER BY t.updated_at DESC`,
		input.UserId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not fetch trades", nil)
		return
	}
	defer rows.Close()

	trades, _ := buildTradeDetails(rows)
	ResponseJSON(c, http.StatusOK, "Trades fetched", trades)
}

func GetTradeHistory(c *gin.Context) {
	var input TradeActionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	rows, err := db.Conn.Queryx(`
		SELECT t.id, t.status, t.initiator_id, ui.username as initiator_username,
			t.recipient_id, ur.username as recipient_username, t.pending_user_id,
			t.created_at, t.updated_at
		FROM trades t
		JOIN users ui ON ui.id = t.initiator_id
		JOIN users ur ON ur.id = t.recipient_id
		WHERE (t.initiator_id=$1 OR t.recipient_id=$1) AND t.status='accepted'
		ORDER BY t.updated_at DESC
		LIMIT 20`,
		input.UserId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not fetch trade history", nil)
		return
	}
	defer rows.Close()

	trades, _ := buildTradeDetails(rows)
	ResponseJSON(c, http.StatusOK, "Trade history fetched", trades)
}

func AcceptTrade(c *gin.Context) {
	tradeId := c.Param("id")
	var input TradeActionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	var trade struct {
		InitiatorId   int    `db:"initiator_id"`
		RecipientId   int    `db:"recipient_id"`
		PendingUserId int    `db:"pending_user_id"`
		Status        string `db:"status"`
	}
	err := db.Conn.QueryRowx(
		`SELECT initiator_id, recipient_id, pending_user_id, status FROM trades WHERE id=$1`,
		tradeId).StructScan(&trade)
	if err != nil {
		ResponseJSON(c, http.StatusNotFound, "Trade not found", nil)
		return
	}
	if trade.Status != "pending" {
		ResponseJSON(c, http.StatusBadRequest, "Trade is no longer active", nil)
		return
	}
	if trade.PendingUserId != input.UserId {
		ResponseJSON(c, http.StatusForbidden, "Not your turn to respond", nil)
		return
	}

	rows, err := db.Conn.Queryx(
		`SELECT ti.user_card_id, ti.offered_by_user_id FROM trade_items ti WHERE ti.trade_id=$1`,
		tradeId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not fetch trade items", nil)
		return
	}
	defer rows.Close()

	type itemRow struct {
		UserCardId      *int `db:"user_card_id"`
		OfferedByUserId int  `db:"offered_by_user_id"`
	}
	items := []itemRow{}
	for rows.Next() {
		var item itemRow
		if err := rows.StructScan(&item); err != nil {
			continue
		}
		items = append(items, item)
	}

	for _, item := range items {
		if item.UserCardId == nil {
			db.Conn.Exec(`UPDATE trades SET status='cancelled', updated_at=NOW() WHERE id=$1`, tradeId)
			ResponseJSON(c, http.StatusConflict, "Trade cancelled: a card is no longer available", nil)
			return
		}
		var count int
		err := db.Conn.QueryRowx(
			`SELECT COUNT(*) FROM user_cards WHERE id=$1 AND user_id=$2`,
			*item.UserCardId, item.OfferedByUserId).Scan(&count)
		if err != nil || count == 0 {
			db.Conn.Exec(`UPDATE trades SET status='cancelled', updated_at=NOW() WHERE id=$1`, tradeId)
			ResponseJSON(c, http.StatusConflict, "Trade cancelled: a card is no longer available", nil)
			return
		}
	}

	for _, item := range items {
		otherUserId := trade.RecipientId
		if item.OfferedByUserId == trade.RecipientId {
			otherUserId = trade.InitiatorId
		}
		_, err := db.Conn.Exec(
			`UPDATE user_cards SET user_id=$1 WHERE id=$2`,
			otherUserId, *item.UserCardId)
		if err != nil {
			ResponseJSON(c, http.StatusInternalServerError, "Could not transfer cards", nil)
			return
		}
	}

	_, err = db.Conn.Exec(`UPDATE trades SET status='accepted', updated_at=NOW() WHERE id=$1`, tradeId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not complete trade", nil)
		return
	}

	ResponseJSON(c, http.StatusOK, "Trade accepted", nil)
}

func RejectTrade(c *gin.Context) {
	tradeId := c.Param("id")
	var input TradeActionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	var pendingUserId int
	var status string
	err := db.Conn.QueryRowx(
		`SELECT pending_user_id, status FROM trades WHERE id=$1`, tradeId).Scan(&pendingUserId, &status)
	if err != nil {
		ResponseJSON(c, http.StatusNotFound, "Trade not found", nil)
		return
	}
	if status != "pending" {
		ResponseJSON(c, http.StatusBadRequest, "Trade is no longer active", nil)
		return
	}
	if pendingUserId != input.UserId {
		ResponseJSON(c, http.StatusForbidden, "Not your turn to respond", nil)
		return
	}

	_, err = db.Conn.Exec(`UPDATE trades SET status='rejected', updated_at=NOW() WHERE id=$1`, tradeId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not reject trade", nil)
		return
	}

	ResponseJSON(c, http.StatusOK, "Trade rejected", nil)
}

func CancelTrade(c *gin.Context) {
	tradeId := c.Param("id")
	var input TradeActionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	var count int
	err := db.Conn.QueryRowx(`
		SELECT COUNT(*) FROM trades
		WHERE id=$1 AND (initiator_id=$2 OR recipient_id=$2) AND status='pending'`,
		tradeId, input.UserId).Scan(&count)
	if err != nil || count == 0 {
		ResponseJSON(c, http.StatusForbidden, "Cannot cancel this trade", nil)
		return
	}

	_, err = db.Conn.Exec(`UPDATE trades SET status='cancelled', updated_at=NOW() WHERE id=$1`, tradeId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not cancel trade", nil)
		return
	}

	ResponseJSON(c, http.StatusOK, "Trade cancelled", nil)
}

func CounterTrade(c *gin.Context) {
	tradeId := c.Param("id")
	var input CounterTradeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Invalid request payload", nil)
		return
	}

	if len(input.NewOfferedCardIds)+len(input.NewRequestedCardIds) == 0 {
		ResponseJSON(c, http.StatusBadRequest, "Counter offer must include at least one card", nil)
		return
	}
	if len(input.NewOfferedCardIds) > 5 || len(input.NewRequestedCardIds) > 5 {
		ResponseJSON(c, http.StatusBadRequest, "Maximum 5 cards per side", nil)
		return
	}

	var trade struct {
		InitiatorId   int    `db:"initiator_id"`
		RecipientId   int    `db:"recipient_id"`
		PendingUserId int    `db:"pending_user_id"`
		Status        string `db:"status"`
	}
	err := db.Conn.QueryRowx(
		`SELECT initiator_id, recipient_id, pending_user_id, status FROM trades WHERE id=$1`,
		tradeId).StructScan(&trade)
	if err != nil {
		ResponseJSON(c, http.StatusNotFound, "Trade not found", nil)
		return
	}
	if trade.Status != "pending" {
		ResponseJSON(c, http.StatusBadRequest, "Trade is no longer active", nil)
		return
	}
	if trade.PendingUserId != input.UserId {
		ResponseJSON(c, http.StatusForbidden, "Not your turn to respond", nil)
		return
	}

	otherUserId := trade.InitiatorId
	if input.UserId == trade.InitiatorId {
		otherUserId = trade.RecipientId
	}

	offeredOwnership, err := validateCardOwnership(input.UserId, input.NewOfferedCardIds)
	if err != nil {
		ResponseJSON(c, http.StatusBadRequest, "You do not own one or more offered cards", nil)
		return
	}

	requestedOwnership, err := validateCardOwnership(otherUserId, input.NewRequestedCardIds)
	if err != nil {
		ResponseJSON(c, http.StatusBadRequest, "Other party does not own one or more requested cards", nil)
		return
	}

	_, err = db.Conn.Exec(`DELETE FROM trade_items WHERE trade_id=$1`, tradeId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not update trade", nil)
		return
	}

	for _, oc := range offeredOwnership {
		_, err = db.Conn.Exec(
			`INSERT INTO trade_items (trade_id, user_card_id, offered_by_user_id, card_id) VALUES ($1, $2, $3, $4)`,
			tradeId, oc.UserCardId, input.UserId, oc.CardId)
		if err != nil {
			ResponseJSON(c, http.StatusInternalServerError, "Could not update trade items", nil)
			return
		}
	}
	for _, rc := range requestedOwnership {
		_, err = db.Conn.Exec(
			`INSERT INTO trade_items (trade_id, user_card_id, offered_by_user_id, card_id) VALUES ($1, $2, $3, $4)`,
			tradeId, rc.UserCardId, otherUserId, rc.CardId)
		if err != nil {
			ResponseJSON(c, http.StatusInternalServerError, "Could not update trade items", nil)
			return
		}
	}

	_, err = db.Conn.Exec(`
		UPDATE trades SET pending_user_id=$1, updated_at=NOW() WHERE id=$2`,
		otherUserId, tradeId)
	if err != nil {
		ResponseJSON(c, http.StatusInternalServerError, "Could not update trade", nil)
		return
	}

	ResponseJSON(c, http.StatusOK, "Counter offer sent", nil)
}
