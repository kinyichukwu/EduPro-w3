import { useEffect, RefObject } from 'react'

export const useScrollLock = (
  lock: boolean,
  modalRef?: RefObject<HTMLElement | null>,
  onClickOutside?: () => void,
  excludedRef?: RefObject<HTMLElement | null>
) => {
  useEffect(() => {
    const originalPaddingRight = window.getComputedStyle(
      document.body
    ).paddingRight
    const hasVerticalScrollbar =
      window.innerWidth > document.documentElement.clientWidth

    // Add click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef?.current &&
        !modalRef.current.contains(event.target as Node) &&
        !(excludedRef?.current && excludedRef.current.contains(event.target as Node)) &&
        onClickOutside
      ) {
        onClickOutside()
      }
    }

    if (lock) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth

      // Save the current scroll position
      document.documentElement.style.setProperty(
        '--scroll-position',
        `${window.scrollY}px`
      )

      // Set body styles to prevent scroll while maintaining position
      document.body.style.position = 'fixed'
      document.body.style.top = `calc(-1 * var(--scroll-position))`
      document.body.style.width = '100%'

      // Add padding to prevent content shift when scrollbar disappears
      if (hasVerticalScrollbar) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }

      // Add click outside listener when locked
      if (modalRef && onClickOutside) {
        document.addEventListener('mouseup', handleClickOutside)
      }
    }

    return () => {
      if (lock) {
        // Restore original body styles
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.paddingRight = originalPaddingRight

        // Restore scroll position
        window.scrollTo(
          0,
          parseInt(
            document.documentElement.style.getPropertyValue(
              '--scroll-position'
            ) || '0'
          )
        )

        // Remove click outside listener
        if (modalRef && onClickOutside) {
          document.removeEventListener('mouseup', handleClickOutside)
        }
      }
    }
  }, [lock, modalRef, onClickOutside, excludedRef])
}