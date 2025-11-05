import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import AddExpense from "./AddExpense";

import Calendar from "./Calendar";

import Drivers from "./Drivers";

import Reports from "./Reports";

import Backup from "./Backup";

import Users from "./Users";

import Employees from "./Employees";

import Settings from "./Settings";

import PrintTemplates from "./PrintTemplates";

import PrintSettings from "./PrintSettings";

import Login from "./Login";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    AddExpense: AddExpense,
    
    Calendar: Calendar,
    
    Drivers: Drivers,
    
    Reports: Reports,
    
    Backup: Backup,
    
    Users: Users,
    
    Employees: Employees,
    
    Settings: Settings,
    
    PrintTemplates: PrintTemplates,
    
    PrintSettings: PrintSettings,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    // Login page doesn't need Layout wrapper
    if (location.pathname === '/login') {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
            </Routes>
        );
    }
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/AddExpense" element={<AddExpense />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/Drivers" element={<Drivers />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/Backup" element={<Backup />} />
                
                <Route path="/Users" element={<Users />} />
                
                <Route path="/Employees" element={<Employees />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/PrintTemplates" element={<PrintTemplates />} />
                
                <Route path="/PrintSettings" element={<PrintSettings />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}