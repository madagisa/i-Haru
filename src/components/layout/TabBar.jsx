import { NavLink } from 'react-router-dom'
import { Home, Calendar, Package, Settings } from 'lucide-react'
import './TabBar.css'

const tabs = [
    { path: '/', icon: Home, label: '오늘' },
    { path: '/schedule', icon: Calendar, label: '일정' },
    { path: '/prep', icon: Package, label: '준비물/과제' },
    { path: '/settings', icon: Settings, label: '설정' }
]

function TabBar() {
    return (
        <nav className="tab-bar">
            <div className="tab-bar-content">
                {tabs.map(tab => (
                    <NavLink
                        key={tab.path}
                        to={tab.path}
                        className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
                        end={tab.path === '/'}
                    >
                        <tab.icon className="tab-icon" size={24} />
                        <span className="tab-label">{tab.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}

export default TabBar
