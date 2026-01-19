import { Outlet } from 'react-router-dom'
import Header from './Header'
import TabBar from './TabBar'
import './Layout.css'

function Layout() {
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
