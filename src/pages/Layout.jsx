

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { LayoutDashboard, PlusCircle, Users, FileText, Calendar, ChevronRight, ChevronLeft, Database, UserCog, Settings as SettingsIcon, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = 'hershufo23@gmail.com';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, []);

  const isAdmin = currentUser?.email === ADMIN_EMAIL || currentUser?.role === 'admin';

  const navigationItems = [
    {
      title: "داشبۆرد",
      url: createPageUrl("Dashboard"),
      icon: LayoutDashboard,
    },
    {
      title: "زیادکردنی خەرجی",
      url: createPageUrl("AddExpense"),
      icon: PlusCircle,
    },
    {
      title: "کالێندەر",
      url: createPageUrl("Calendar"),
      icon: Calendar,
    },
    {
      title: "شۆفێرەکان",
      url: createPageUrl("Drivers"),
      icon: Users,
    },
    {
      title: "کارمەندان",
      url: createPageUrl("Employees"),
      icon: Users,
    },
    {
      title: "ڕاپۆرتەکان",
      url: createPageUrl("Reports"),
      icon: FileText,
    },
    {
      title: "پاشەکەوتکردن",
      url: createPageUrl("Backup"),
      icon: Database,
    },
  ];

  if (isAdmin) {
    navigationItems.push({
      title: "بەکارهێنەران",
      url: createPageUrl("Users"),
      icon: UserCog,
    });
    navigationItems.push({
      title: "ڕێکخستنەکان",
      url: createPageUrl("Settings"),
      icon: SettingsIcon,
    });
    navigationItems.push({
      title: "ڕێکخستنی چاپکردن",
      url: createPageUrl("PrintSettings"),
      icon: Printer,
    });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap');
        
        * {
          direction: rtl;
          font-family: 'Noto Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif !important;
        }
        
        body {
          background: #F9FAFB;
        }
        
        .sidebar-rtl {
          border-left: 1px solid #E5E7EB;
          border-right: none;
          transition: all 0.3s ease-in-out;
          width: ${sidebarOpen ? '280px' : '0px'};
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .sidebar-rtl {
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            z-index: 50;
            background: white;
            width: ${sidebarOpen ? '280px' : '0px'};
          }
        }
      `}</style>
      
      <div className="min-h-screen flex w-full bg-gray-50" style={{direction: 'rtl'}}>
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="sidebar-rtl border-l border-gray-200 md:relative fixed z-50">
          <div className="h-full flex flex-col bg-white w-[280px]">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">سیستەمی خەرجی</h2>
                  <p className="text-xs text-gray-500">کۆمپaniای کرێی ئامێرەکان</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto">
              <div className="mb-6">
                <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                  مینیوی سەرەکی
                </div>
                <div>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 rounded-lg mb-1 ${
                        location.pathname === item.url ? 'bg-emerald-50 text-emerald-700 shadow-sm' : ''
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-[15px]">{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {currentUser?.full_name?.charAt(0) || 'ب'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {currentUser?.full_name || 'بەڕێوەبەر'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'بەڕێوەبەر' : 'بەکارهێنەر'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-1/2 -translate-y-1/2 z-50 shadow-lg bg-white hover:bg-gray-100 rounded-full w-8 h-8"
          style={{ right: sidebarOpen ? '280px' : '0px', transition: 'right 0.3s ease-in-out' }}
        >
          {sidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>

        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

