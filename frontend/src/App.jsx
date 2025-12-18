import { useState, useEffect } from 'react'
import api from './api'
import './index.css'

// We will import components later, for now define placeholders or keep it all in one file for simplicity if small?
// No, better to separate. But for the first pass, I'll build the skeleton here or create files in next turn.
// I will create a basic App structure that renders different sections.

import ResourceList from './components/ResourceList'
import EventManager from './components/EventManager'
import Report from './components/Report'

function App() {
    const [activeTab, setActiveTab] = useState('events');

    return (
        <div className="container">
            <div className="header-nav">
                <div>
                    <h1>Event Scheduler</h1>
                    <p className="text-subtle">Manage your events and resources efficiently</p>
                </div>
                <div className="nav-tabs">
                    <button
                        className={`btn btn-ghost ${activeTab === 'events' ? 'active' : ''}`}
                        onClick={() => setActiveTab('events')}
                    >
                        Events & Allocation
                    </button>
                    <button
                        className={`btn btn-ghost ${activeTab === 'resources' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resources')}
                    >
                        Resources
                    </button>
                    <button
                        className={`btn btn-ghost ${activeTab === 'report' ? 'active' : ''}`}
                        onClick={() => setActiveTab('report')}
                    >
                        Report
                    </button>
                </div>
            </div>

            <div className="content">
                {activeTab === 'resources' && <ResourceList />}
                {activeTab === 'events' && <EventManager />}
                {activeTab === 'report' && <Report />}
            </div>
        </div>
    )
}

export default App
