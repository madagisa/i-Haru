import { Outlet } from 'react-router-dom'
import Header from './Header'
import TabBar from './TabBar'
import { useRealtimeSync } from '../../hooks/useRealtimeSync'
import './Layout.css'

function Layout() {
    // Enable real-time sync
    useRealtimeSync()

    return (
        <div className="layout">
            <Header />
            <main className="layout-main">
                <Outlet />
            </main>
            <TabBar />
        </div>
    )
}

export default Layout
