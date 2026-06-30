import tellerDefault from '../assets/teller/default.png'
import tellerDialogue from '../assets/teller/dialogue.png'
import tellerMinus from '../assets/teller/minus.png'

export type TellerVariant = 'default' | 'dialogue' | 'minus'

interface TellerAvatarProps {
  variant?: TellerVariant
}

const VARIANT_SRC: Record<TellerVariant, string> = {
  default: tellerDefault,
  dialogue: tellerDialogue,
  minus: tellerMinus
}

export default function TellerAvatar({ variant = 'default' }: TellerAvatarProps) {
  return (
    <img
      src={VARIANT_SRC[variant]}
      alt="Teller"
      className="teller-avatar-img"
      key={variant}
    />
  )
}
