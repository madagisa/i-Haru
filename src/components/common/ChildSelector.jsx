import { useFamilyStore } from '../../store/familyStore'
import './ChildSelector.css'

function ChildSelector({ value, onChange, includeAll = false, required = false }) {
    const { children } = useFamilyStore()

    if (children.length === 0) {
        return null
    }

    return (
        <div className="child-selector">
            <label className="input-label">자녀 선택{required && ' *'}</label>
            <div className="child-chips">
                {includeAll && (
                    <button
                        type="button"
                        className={`child-chip ${value === null ? 'selected' : ''}`}
                        onClick={() => onChange(null)}
                    >
                        전체
                    </button>
                )}
                {children.map(child => (
                    <button
                        key={child.id}
                        type="button"
                        className={`child-chip ${value === child.id ? 'selected' : ''}`}
                        style={{
                            '--child-color': child.color,
                            borderColor: value === child.id ? child.color : undefined,
                            background: value === child.id ? child.color : undefined
                        }}
                        onClick={() => onChange(child.id)}
                    >
                        <span
                            className="child-chip-dot"
                            style={{ background: child.color }}
                        />
                        {child.name}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default ChildSelector
