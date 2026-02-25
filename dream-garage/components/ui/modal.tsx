import { createPortal } from 'react-dom'
import { XIcon } from 'lucide-react'

type modalProps = {
  showModal: boolean
  children: React.ReactNode
  title: string
  onClose: () => void
}

export default function Modal({
  showModal,
  children,
  title,
  onClose
}: modalProps) {
  return (
    <>
      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <div
              className="animate-modal-enter bg-background relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <div className="w-6" />
                <h3>{title}</h3>
                <XIcon
                  className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  size={18}
                  onClick={() => onClose()}
                />
              </div>
              <div className="p-4">{children}</div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
