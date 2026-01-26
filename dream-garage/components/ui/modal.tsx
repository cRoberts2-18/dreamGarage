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
          <div className="bg-background absolute border-1 border-solid border-secondary left-1/4 top-1/4 w-1/2 min-h-1/2 rounded-xl shadow-md/40">
            <div className="flex justify-between py-2 text-center font-semibold">
              <div className="w-10"></div>
              <h3 className="">{title}</h3>
              <div className="w-10">
                <XIcon onClick={() => onClose()} />
              </div>
            </div>
            <hr />
            {children}
          </div>,
          document.body
        )}
    </>
  )
}
