import { useAuthStore } from '../../store/authStore'
import { useFamilyStore } from '../../store/familyStore'
import { Bell, ChevronDown } from 'lucide-react'
import './Header.css'

function Header() {
    const { user } = useAuthStore()
    const { children, selectedChildId, setSelectedChild } = useFamilyStore()

    const isParent = user?.role === 'parent'

    const handleChildFilter = (e) => {
        const value = e.target.value
        setSelectedChild(value === 'all' ? null : value)
    }

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <h1 className="header-logo">
                        <span className="header-logo-icon">🌸</span>
                        <span className="header-logo-text">아이하루</span>
                    </h1>
                </div>

                <div className="header-center">
                    {isParent && children.length > 0 && (
                        <div className="child-filter">
                            <select
                                className="child-filter-select"
                                value={selectedChildId || 'all'}
                                onChange={handleChildFilter}
                            >
                                <option value="all">전체 자녀</option>
                                {children.map(child => (
                                    <option key={child.id} value={child.id}>
                                        {child.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="child-filter-icon" size={16} />
                        </div>
                    )}
                </div>

                <div className="header-right">
                    <button className="header-notification">
                        <Bell size={22} />
                        <span className="notification-badge">2</span>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
