import { Fragment, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'

export interface AnimatedTextProps {
  text: string
  className?: string
  style?: CSSProperties
  delay?: number
  stagger?: number
}

export function AnimatedText({
  text,
  className,
  style,
  delay = 0,
  stagger = 0.02,
}: AnimatedTextProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return (
      <span className={className} style={style}>
        {text}
      </span>
    )
  }

  let letterIndex = 0
  const words = text.split(' ').map((word) =>
    Array.from(word).map((char) => {
      const index = letterIndex
      letterIndex += 1
      return { char, index }
    }),
  )

  return (
    <span className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((letters, wordIndex) => (
          <Fragment key={wordIndex}>
            <span className="inline-block whitespace-nowrap">
              {letters.map(({ char, index }) => (
                <motion.span
                  key={index}
                  className="inline-block"
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.35, delay: delay + index * stagger, ease: 'easeOut' }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
            {wordIndex < words.length - 1 ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </span>
  )
}
