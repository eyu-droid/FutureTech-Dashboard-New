import { cn } from "@/lib/utils";
import { Menu, MenuIcon, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { useSelectedEmailStore } from "store/selectedemailstore";
import { Badge } from "./ui/badge";
import { useUserStore } from "store/userstore";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "./authprovider";
import Loading from "./loading";

export const MobileSideMenu = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { selectedUserEmails } = useSelectedEmailStore()
    const { user } = useUserStore();
    const auth = useAuth();

    const {data, isLoading} = useQuery({
        queryKey: ['user-menus', user?.role],
        queryFn: async()=>{
            //fetch menus by role
            if(!user?.role){
                return [];
            }
            const res = await axiosInstance.get('permission/getmenutreebyrole/'+user?.role,{
                headers:{
                    'Authorization': 'Bearer '+auth?.token
                }
            });
            return res.data;
        }
    })
    console.log(data);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (
        <>
            <style>
                {`
                /* Target the main navigation scrollbar */

                /* Target the main content area scrollbar */
                .main-content::-webkit-scrollbar {
                    width: 8px;
                }

                .main-content::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }

                .main-content::-webkit-scrollbar-thumb {
                    background-color: #888;
                    border-radius: 10px;
                }

                .main-content::-webkit-scrollbar-thumb:hover {
                    background-color: #555;
                }
                `}
            </style>
            <div
                className={cn("fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden", { 'hidden': !isSidebarOpen })}
                onClick={toggleSidebar}
            >
                <Menu className="w-10 h-10" />
            </div>
            <aside
                className={`fixed inset-y-0 left-0 w-72 bg-purple-600 text-white flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 z-50`}
            >
                <div className="p-6 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <img src="https://futuretechaddis.com/wp-content/uploads/2025/04/logo-future-.png" alt="Logo" className="object-contain w-28 h-28  rounded-lg" />

                    </div>
                </div>
                {/* make scroll bar  */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto sidebar-nav">
                    {/* Navigation Links */}
                    {isLoading && <Loading/>}
                    { !isLoading && data.data?.map((menuItem: any)=>(
                        <>
                         {menuItem.children.length > 0 && (
                            <>
                                <span className="text-xs font-semibold uppercase text-purple-200 px-4 py-2 mt-4 block">{menuItem.menuName}</span>
                                {menuItem.children.map((childItem:any)=>(
                                    <Link to={childItem.route} className="flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                                        <span>{childItem.menuName}</span>
                                    </Link>
                                ))}
                            </>
                         )}
                        </>
                    ))}
                    {/*
                   <span className="text-xs font-semibold uppercase text-purple-200 px-4 py-2 mt-4 block">Overview</span>

                    <Link to="/dashboard/home" className="flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                        <span>Dashboard</span>
                    </Link>
                    <span className="text-xs font-semibold uppercase text-purple-200 px-4 py-2 mt-4 block">Participants</span>
                    <Link to='/dashboard/submission/embassies' className="flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>Embassy Delegation</span>
                    </Link>
                    <Link to='/dashboard/submission/internationalcompany' className="flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>International Companies</span>
                    </Link>
                    <Link to='/dashboard/submission/localcompany' className="flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>Local Companies</span>
                    </Link>
                    <Link to='/dashboard/submission/ngo' className="flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>NGO Or Foundations</span>
                    </Link>
                    <Link to='/dashboard/submission/startups' className="flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>StartUp</span>
                    </Link>
                     <span className="text-xs font-semibold uppercase text-purple-200 px-4 py-2 mt-4 block">Attendees</span>
                     <Link to="/dashboard/submission/event" className="flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>Event</span>
                     </Link>
                     <Link to="/dashboard/submission/conference" className="flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span>Conference</span>
                     </Link>
                     <span className="text-xs font-semibold uppercase text-purple-200 px-4 py-2 mt-4 block">Messages</span>
                    <Link to="#" className="flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span>Create Template</span>
                    </Link>
                    <Link to="/dashboard/messages" className="flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span>Messages {selectedUserEmails.length >0 && (<Badge variant='default'>{selectedUserEmails.length}</Badge>)}</span>
                    </Link>

                    <span className="text-xs font-semibold uppercase text-purple-200 px-4 py-2 mt-4 block">Event Manage</span>
                    <Link to="#" className="flex items-center px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span>Tickets</span>
                    </Link>
                    <Link to='/dashboard/checkin' className="flex items-center px-4 py-3 rounded-lg  bg-opacity-20 font-semibold transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                        <span>Check-in</span>
                    </Link>
                    <Link to='/dashboard/checkin' className="flex items-center px-4 py-3 rounded-lg  bg-opacity-20 font-semibold transition-colors duration-200">
                        <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                        <span>Confirmed</span>
                    </Link>
                    <span className="text-xs font-semibold uppercase text-purple-200 px-4 py-2 mt-4 block">Partners</span>
                    <Link to="/dashboard/partners" className="flex items-center gap-2">
                          <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                          <span>Companies</span>
                    </Link>
                    <span className="text-xs font-semibold uppercase text-purple-200 px-4 py-2 mt-4 block">Admin</span>
                    <Link to="/dashboard/users" className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Users</span>
                    </Link>

                    <Link to="/dashboard/roles" className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Roles</span>
                    </Link>
                    */}

                </nav>
            </aside>
            <button
                id="menu-button"
                className="lg:hidden fixed top-6 left-6 z-50 text-purple-600 focus:outline-none"
                onClick={toggleSidebar}
            >
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </>
    )
}
