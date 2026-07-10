import { MaskedField } from 'trading-squad-ds'

export const Masked = () => (
  <div style={{ padding: 20, maxWidth: 420 }}>
    <MaskedField value="aBc1••••••••••••dEf9" revealed={false} onReveal={() => {}} />
  </div>
)

export const Revealed = () => (
  <div style={{ padding: 20, maxWidth: 420 }}>
    <MaskedField value="aBc1XyZ9QwErTyDef9" revealed={true} onReveal={() => {}} />
  </div>
)

export const WithRotate = () => (
  <div style={{ padding: 20, maxWidth: 420 }}>
    <MaskedField value="xYz7••••••••••••mNo3" revealed={false} onReveal={() => {}} onRotate={() => {}} />
  </div>
)
