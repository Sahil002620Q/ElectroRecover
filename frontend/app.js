const { useState, useEffect, createContext, useContext } = React;

// --- API Configuration ---
// Change this to your Render backend URL after deployment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://electro-recover-api.onrender.com'; // User will replace this

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- Auth Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (err) {
                    console.error("Auth check failed", err);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const formData = new FormData(); // FastAPI OAuth2 expects form data strictly? No, our schema is JSON
        // Wait, our backend expects JSON for /auth/login based on schema? 
        // Let's check schemas.UserLogin. It's a Pydantic model, so JSON body is expected.
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.access_token);
        setUser(res.data.user);
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        localStorage.setItem('token', res.data.access_token);
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

// --- Components ---

const Navbar = ({ setPage, darkMode, setDarkMode }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        setPage('home');
    };

    const navigate = (page) => {
        setPage(page);
    };

    return (
        <nav className="glass-panel sticky top-0 z-50 shadow-sm border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Header Row */}
                <div className="flex justify-between h-16 items-center">
                    <div className="flex cursor-pointer items-center" onClick={() => navigate('home')}>
                        <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                            ElectroRecover
                        </span>
                    </div>

                    {/* Right side: User & Theme Toggle */}
                    <div className="flex items-center space-x-2">
                        {/* Mobile Settings Indicator */}
                        <div className="md:hidden flex items-center space-x-1 mr-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Settings</span>
                        </div>

                        {/* Theme Toggle */}
                        <button 
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm"
                            title="Toggle Dark Mode"
                        >
                            {darkMode ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 18v1m9-9h1m-18 0h1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 0A9 9 0 115.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        <div className="hidden md:flex items-center space-x-4 border-l pl-4 border-slate-200">
                            {user ? (
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-slate-500">Hi, {user.name}</span>
                                    <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium">Logout</button>
                                </div>
                            ) : (
                                <button onClick={() => navigate('login')} className="text-slate-600 hover:text-primary font-medium transition-colors">Login</button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Secondary Row (Action Buttons) - Visible Directly in Phone View & Desktop */}
                <div className="flex items-center space-x-2 pb-3 overflow-x-auto no-scrollbar scroll-smooth">
                    <button 
                        onClick={() => navigate('home')} 
                        className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                        Browse
                    </button>
                    
                    {user ? (
                        <>
                            <button 
                                onClick={() => navigate('create-listing')} 
                                className="flex-shrink-0 bg-primary text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-primary-dark shadow-md shadow-primary/20 transition-all"
                            >
                                + Sell Item
                            </button>
                            <button 
                                onClick={() => navigate('create-website-listing')} 
                                className="flex-shrink-0 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-slate-800 dark:hover:bg-white transition-all shadow-md"
                            >
                                🌐 Website
                            </button>
                            <button 
                                onClick={() => navigate('dashboard')} 
                                className="flex-shrink-0 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                            >
                                Dashboard
                            </button>
                            <button onClick={handleLogout} className="md:hidden flex-shrink-0 text-red-500 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-red-50 transition-all border border-red-100">
                                Logout
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => navigate('register')} 
                            className="flex-shrink-0 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-slate-800 dark:hover:bg-white transition-all shadow-md"
                        >
                            Register
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

const ListingCard = ({ listing, onRequest, isRequested }) => {
    return (
        <div className="btn-animated bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl group">
            <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                {listing.photos && listing.photos.length > 0 ? (
                    <img src={listing.photos[0]} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="text-slate-300 flex flex-col items-center">
                        <span className="text-4xl mb-2">📷</span>
                        <span className="text-sm font-medium">No Image</span>
                    </div>
                )}
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${listing.status === 'active' ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}>
                        {listing.status}
                    </span>
                </div>
            </div>
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {listing.category}
                    </span>
                    <span className="text-xl font-bold text-slate-900">${listing.price}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">{listing.title}</h3>

                {listing.category.toLowerCase().includes('website') ? (
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                            <span className="text-slate-400 w-24">URL:</span>
                            <span className="text-primary font-medium truncate">{listing.website_url || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="text-slate-400 w-24">Revenue:</span>
                            <span className="text-green-600 font-bold">${listing.monthly_revenue}/mo</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="text-slate-400 w-24">Traffic:</span>
                            <span className="text-slate-600 font-medium">{listing.monthly_traffic?.toLocaleString()} visits/mo</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 mb-4">{listing.brand} • {listing.model}</p>
                )}

                <div className="space-y-2 mb-4">
                    {!listing.category.toLowerCase().includes('website') && (
                        <div className="flex items-center text-sm">
                            <span className="text-slate-400 w-20">Condition:</span>
                            <span className={`font-medium ${listing.condition === 'broken' ? 'text-red-500' : 'text-green-500'}`}>
                                {listing.condition.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center text-sm">
                        <span className="text-slate-400 w-20">Location:</span>
                        <span className="text-slate-600 truncate">{listing.location}</span>
                    </div>
                </div>

                {listing.status === 'active' && (
                    <div className="space-y-2">
                        <button
                            onClick={() => !isRequested && onRequest(listing.id)}
                            disabled={isRequested}
                            className={`w-full btn-animated py-2.5 rounded-xl border-2 font-bold transition-all ${isRequested 
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                : listing.category.toLowerCase().includes('website')
                                    ? 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
                                    : 'border-primary text-primary hover:bg-primary hover:text-white'
                                }`}
                        >
                            {isRequested 
                                ? '✓ Request Sent' 
                                : (listing.category.toLowerCase().includes('website') ? 'Get Ownership' : 'Request to Buy')}
                        </button>
                        
                        {listing.seller_phone && (
                            <a 
                                href={`https://wa.me/${listing.seller_phone.replace(/\D/g, '')}?text=Hi, I am interested in your listing: ${listing.title}`}
                                target="_blank"
                                className="w-full flex items-center justify-center space-x-2 bg-[#25D366] text-white py-2.5 rounded-xl font-bold hover:bg-[#128C7E] shadow-md transition-all"
                            >
                                <span>💬</span> <span>WhatsApp Seller</span>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Pages ---

const HomePage = ({ setPage }) => {
    const [listings, setListings] = useState([]);
    const [filters, setFilters] = useState({ category: '', condition: '' });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        fetchListings();
    }, [filters]);

    const fetchListings = async () => {
        try {
            const params = {};
            if (filters.category) params.category = filters.category;
            if (filters.condition) params.condition = filters.condition;

            const res = await api.get('/listings/', { params });
            setListings(res.data);
        } catch (err) {
            console.error("Failed to fetch listings", err);
        }
    };

    const [requestedIds, setRequestedIds] = useState(new Set());

    const handleBuyRequest = async (listingId) => {
        try {
            const res = await api.post('/requests/', { listing_id: listingId });
            console.log("Request created:", res.data);
            setRequestedIds(prev => new Set([...prev, listingId]));
            alert("SUCCESS: Your request has been sent! Check the Dashboard to track it.");
        } catch (err) {
            const errorMsg = err.response?.data?.detail || "Failed to send request. You might need to login.";
            alert(errorMsg);
            if (err.response?.status === 401) setPage('login');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Explore Marketplace</h1>
                    <p className="text-slate-500 mt-1">Find the best deals on broken electronics and websites</p>
                </div>
                
                <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center space-x-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold text-slate-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>Filters</span>
                    {(filters.category || filters.condition) && (
                        <span className="bg-primary text-white text-[10px] h-5 w-5 flex items-center justify-center rounded-full">
                            !
                        </span>
                    )}
                </button>
            </div>

            {/* Filter Modal */}
            {isFilterOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Filter Listings</h3>
                            <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                <input
                                    type="text"
                                    className="w-full border-slate-200 rounded-xl shadow-sm p-3 border focus:ring-primary focus:border-primary transition-all"
                                    placeholder="e.g. Phone, Laptop, Website"
                                    value={filters.category}
                                    onChange={e => setFilters({ ...filters, category: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Condition</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['', 'broken', 'for_parts', 'used', 'new'].map(cond => (
                                        <button
                                            key={cond}
                                            onClick={() => setFilters({ ...filters, condition: cond })}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${filters.condition === cond 
                                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-primary/30'}`}
                                        >
                                            {cond === '' ? 'All Conditions' : cond.replace('_', ' ').toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button 
                                    onClick={() => {
                                        setFilters({ category: '', condition: '' });
                                        setIsFilterOpen(false);
                                    }}
                                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                                >
                                    Reset
                                </button>
                                <button 
                                    onClick={() => setIsFilterOpen(false)}
                                    className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/30 transition-all"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map(listing => (
                    <ListingCard 
                        key={listing.id} 
                        listing={listing} 
                        onRequest={handleBuyRequest}
                        isRequested={requestedIds.has(listing.id)}
                    />
                ))}
            </div>
            
            {listings.length === 0 && (
                <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-slate-800">No listings found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your filters to find what you're looking for.</p>
                    <button 
                        onClick={() => setFilters({ category: '', condition: '' })}
                        className="mt-6 text-primary font-bold hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
};

const LoginPage = ({ setPage }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            setPage('home');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="glass-panel p-8 rounded-2xl shadow-xl w-full max-w-md animate-[float_6s_ease-in-out_infinite]">
                <h2 className="text-3xl font-bold mb-6 text-center text-slate-800">Welcome Back</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3 transition-all"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3 transition-all"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full btn-animated bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/30">
                        Sign In
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-slate-500">
                    New here? <button onClick={() => setPage('register')} className="text-primary font-bold hover:underline">Create an account</button>
                </div>
            </div>
        </div>
    );
};

const RegisterPage = ({ setPage }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'buyer', location: '', phone: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            setPage('home');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 p-4">
            <div className="glass-panel p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-slate-800">Join the Market</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Phone Number (for WhatsApp)</label>
                        <input
                            type="tel"
                            required
                            placeholder="+91 9876543210"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">I want to</label>
                        <select
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="buyer">Buy Parts & Devices</option>
                            <option value="seller">Sell Broken Items</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Location</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary p-3"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="w-full btn-animated bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/30 mt-2">
                        Create Account
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-slate-500">
                    Already a member? <button onClick={() => setPage('login')} className="text-primary font-bold hover:underline">Log in</button>
                </div>
            </div>
        </div>
    );
};

const CreateListingPage = ({ setPage }) => {
    const [formData, setFormData] = useState({
        title: '', category: '', brand: '', model: '',
        condition: 'broken', price: '', location: '', description: '',
        working_parts: '', photos: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/listings/', {
                ...formData,
                price: parseFloat(formData.price),
                photos: formData.photos ? [formData.photos] : []
            });
            alert('Listing created!');
            setPage('dashboard');
        } catch (err) {
            alert('Failed to create listing: ' + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <input type="text" required className="w-full border p-2 rounded" placeholder="Smartphone"
                            value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Brand</label>
                        <input type="text" className="w-full border p-2 rounded" placeholder="Apple"
                            value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Model</label>
                        <input type="text" className="w-full border p-2 rounded" placeholder="iPhone 12"
                            value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Condition</label>
                        <select className="w-full border p-2 rounded"
                            value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })}>
                            <option value="broken">Broken / Damaged</option>
                            <option value="for_parts">For Parts Only</option>
                            <option value="used">Used / Working</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" required className="w-full border p-2 rounded" placeholder="Broken Screen iPhone 12 Pro Max"
                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Working Parts (if any)</label>
                    <textarea className="w-full border p-2 rounded" placeholder="Motherboard, Battery seem fine..."
                        value={formData.working_parts} onChange={e => setFormData({ ...formData, working_parts: e.target.value })} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea required className="w-full border p-2 rounded h-24" placeholder="Detailed description of the item..."
                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                        <input type="number" step="0.01" required className="w-full border p-2 rounded" placeholder="0.00"
                            value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input type="text" required className="w-full border p-2 rounded" placeholder="City, State"
                            value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Product Image URL</label>
                    <input type="text" className="w-full border p-2 rounded" placeholder="https://example.com/image.jpg"
                        value={formData.photos} onChange={e => setFormData({ ...formData, photos: e.target.value })} />
                    <p className="text-xs text-gray-500 mt-1">Provide a link to a clean, minimal image of your item.</p>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-primary text-white py-3 rounded-md hover:bg-blue-600 font-bold">
                        Post Listing
                    </button>
                    <button type="button" onClick={() => setPage('home')} className="w-full mt-2 text-gray-600 py-2 hover:bg-gray-50 rounded">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

const CreateWebsiteListingPage = ({ setPage }) => {
    const [formData, setFormData] = useState({
        title: '', category: 'Website', website_url: '',
        monthly_revenue: '', monthly_traffic: '', tech_stack: '',
        price: '', location: '', description: '', photos: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/listings/', {
                ...formData,
                price: parseFloat(formData.price),
                monthly_revenue: parseFloat(formData.monthly_revenue),
                monthly_traffic: parseInt(formData.monthly_traffic),
                condition: 'used', // Default for websites
                photos: formData.photos ? [formData.photos] : []
            });
            alert('Website listing created!');
            setPage('dashboard');
        } catch (err) {
            alert('Failed to create listing: ' + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Sell Your Website</h1>
                <p className="text-slate-500">Reach thousands of potential investors and buyers.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl shadow-xl border border-white/50 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Website Title</label>
                    <input type="text" required className="w-full rounded-xl border-gray-200 shadow-sm p-3 focus:ring-primary focus:border-primary border"
                        placeholder="Premium E-commerce Store (Niche: Tech)"
                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Website URL</label>
                        <input type="url" required className="w-full rounded-xl border-gray-200 shadow-sm p-3 focus:ring-primary focus:border-primary border"
                            placeholder="https://example.com"
                            value={formData.website_url} onChange={e => setFormData({ ...formData, website_url: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Tech Stack</label>
                        <input type="text" className="w-full rounded-xl border-gray-200 shadow-sm p-3 focus:ring-primary focus:border-primary border"
                            placeholder="Next.js, Tailwind, Supabase"
                            value={formData.tech_stack} onChange={e => setFormData({ ...formData, tech_stack: e.target.value })} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Monthly Revenue ($)</label>
                        <input type="number" required className="w-full rounded-xl border-gray-200 shadow-sm p-3 focus:ring-primary focus:border-primary border"
                            placeholder="1500"
                            value={formData.monthly_revenue} onChange={e => setFormData({ ...formData, monthly_revenue: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Monthly Traffic (Visits)</label>
                        <input type="number" required className="w-full rounded-xl border-gray-200 shadow-sm p-3 focus:ring-primary focus:border-primary border"
                            placeholder="25000"
                            value={formData.monthly_traffic} onChange={e => setFormData({ ...formData, monthly_traffic: e.target.value })} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Description & Revenue Proof</label>
                    <textarea required className="w-full rounded-xl border-gray-200 shadow-sm p-3 focus:ring-primary focus:border-primary border h-32"
                        placeholder="Describe your business model, growth potential, and why you are selling..."
                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Asking Price ($)</label>
                        <input type="number" step="0.01" required className="w-full rounded-xl border-gray-200 shadow-sm p-3 focus:ring-primary focus:border-primary border"
                            placeholder="50000.00"
                            value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Seller Location</label>
                        <input type="text" required className="w-full rounded-xl border-gray-200 shadow-sm p-3 focus:ring-primary focus:border-primary border"
                            placeholder="Remote / Global"
                            value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Website Preview Image URL</label>
                    <input type="text" className="w-full rounded-xl border-gray-200 shadow-sm p-3 focus:ring-primary focus:border-primary border"
                        placeholder="https://example.com/preview.jpg"
                        value={formData.photos} onChange={e => setFormData({ ...formData, photos: e.target.value })} />
                </div>

                <div className="pt-4 space-y-3">
                    <button type="submit" className="w-full btn-animated bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 shadow-xl">
                        List Website for Sale
                    </button>
                    <button type="button" onClick={() => setPage('home')} className="w-full text-slate-500 py-2 hover:text-slate-800 font-medium transition-colors">
                        Cancel and Go Back
                    </button>
                </div>
            </form>
        </div>
    );
};

const DashboardPage = () => {
    const { user } = useAuth();
    const [myListings, setMyListings] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);

    useEffect(() => {
        if (user) loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        try {
            // In a real app we'd have a specific endpoint for my listings
            // Using logic: fetch all and filter by seller_id (not efficient but works for now)
            // Or use an endpoint if we made one. We haven't made a specific "my-listings" endpoint, 
            // but we can add one or just use correct endpoint. 
            // Actually, we should probably add one, but for now let's just use the requests endpoints which we DID make on "my-requests" and "incoming".

            // Note: listings router has generic filter, but getting "my" listings specifically might need a query param or separate endpoint.
            // Let's leave listings empty for now or try to fetch generic and filter client side (bad practice but works for demo).
            // Better: update backend to support "seller_id" filter.

            const reqSent = await api.get('/requests/my-requests');
            setSentRequests(reqSent.data);

            const reqInc = await api.get('/requests/incoming');
            setIncomingRequests(reqInc.data);

            // Hack for listings:
            const listRes = await api.get('/listings/?limit=100');
            setMyListings(listRes.data.filter(l => l.seller_id === user.id));

        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
        try {
            await api.delete(`/listings/${listingId}`);
            loadDashboardData();
        } catch (err) {
            alert("Failed to delete listing");
        }
    };

    const [editingListing, setEditingListing] = useState(null);

    const handleUpdateListing = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/listings/${editingListing.id}`, editingListing);
            setEditingListing(null);
            loadDashboardData();
            alert("Listing updated successfully!");
        } catch (err) {
            alert("Failed to update listing");
        }
    };

    const handleUpdateStatus = async (reqId, status) => {
        try {
            if (status === 'accept') await api.put(`/requests/${reqId}/accept`);
            if (status === 'reject') await api.put(`/requests/${reqId}/reject`);
            loadDashboardData();
        } catch (err) {
            alert("Action failed");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Seller Dashboard</h1>
                <div className="flex space-x-3">
                    <button onClick={() => window.location.reload()} className="p-2 text-slate-400 hover:text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Manage My Listings (Primary View) */}
            <div className="mb-12">
                <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center">
                    <span className="bg-primary text-white p-1.5 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                    </span>
                    Manage Your Listings & Incoming Requests
                </h2>

                {/* Edit Modal */}
                {editingListing && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingListing(null)}></div>
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative z-10 animate-in fade-in zoom-in duration-200 border border-white/20">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Edit Listing</h3>
                            <form onSubmit={handleUpdateListing} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border-slate-200 rounded-xl p-3 border focus:ring-primary focus:border-primary"
                                        value={editingListing.title}
                                        onChange={e => setEditingListing({...editingListing, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border-slate-200 rounded-xl p-3 border focus:ring-primary focus:border-primary"
                                        value={editingListing.price}
                                        onChange={e => setEditingListing({...editingListing, price: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border-slate-200 rounded-xl p-3 border focus:ring-primary focus:border-primary"
                                        value={editingListing.category}
                                        onChange={e => setEditingListing({...editingListing, category: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                    <textarea
                                        required
                                        rows="3"
                                        className="w-full border-slate-200 rounded-xl p-3 border focus:ring-primary focus:border-primary"
                                        value={editingListing.description}
                                        onChange={e => setEditingListing({...editingListing, description: e.target.value})}
                                    ></textarea>
                                </div>
                                <div className="md:col-span-2 flex space-x-3 pt-4">
                                    <button type="button" onClick={() => setEditingListing(null)} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Cancel</button>
                                    <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/30">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
                {myListings.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                        <p className="text-slate-500 mb-4">You haven't posted any listings yet.</p>
                        <button onClick={() => setPage('create-listing')} className="text-primary font-bold hover:underline">Create your first listing</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {myListings.map(l => {
                            const requestsForThisListing = incomingRequests.filter(r => r.listing_id === l.id);
                            return (
                                <div key={l.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                                    <div className="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{l.title}</h3>
                                            <p className="text-sm text-slate-500">{l.category} • ${l.price}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                onClick={() => setEditingListing(l)}
                                                className="p-2 text-slate-400 hover:text-primary transition-colors"
                                                title="Edit Listing"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteListing(l.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Delete Listing"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                            <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {l.status}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Requests</h4>
                                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {requestsForThisListing.length} Total
                                            </span>
                                        </div>
                                        
                                        {requestsForThisListing.length === 0 ? (
                                            <div className="py-4 text-center">
                                                <p className="text-sm text-slate-400 italic">No buyer requests for this item yet.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {requestsForThisListing.map(req => (
                                                    <div key={req.id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                                    {req.buyer_name ? req.buyer_name[0].toUpperCase() : 'B'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-800 text-sm">{req.buyer_name}</p>
                                                                    <p className="text-[10px] text-slate-500">{req.buyer_location}</p>
                                                                </div>
                                                            </div>
                                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${req.status === 'pending' ? 'bg-amber-100 text-amber-600' : req.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                                {req.status}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex flex-col space-y-2 mt-4">
                                                            {req.status === 'pending' && (
                                                                <div className="flex space-x-2">
                                                                    <button 
                                                                        onClick={() => handleUpdateStatus(req.id, 'accept')}
                                                                        className="flex-1 bg-green-500 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-green-600 shadow-sm transition-all"
                                                                    >
                                                                        Accept Request
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleUpdateStatus(req.id, 'reject')}
                                                                        className="flex-1 bg-red-50 text-red-600 border border-red-100 bg-red-50 text-xs font-bold py-2.5 rounded-lg hover:bg-red-100 transition-all"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                            
                                                            {req.buyer_phone ? (
                                                                <a 
                                                                    href={`https://wa.me/${req.buyer_phone.replace(/\D/g, '')}`} 
                                                                    target="_blank" 
                                                                    className="w-full flex items-center justify-center space-x-2 bg-[#25D366] text-white py-2.5 rounded-lg font-bold text-xs hover:bg-[#128C7E] shadow-sm transition-all"
                                                                >
                                                                    <span>💬</span> <span>WhatsApp Buyer</span>
                                                                </a>
                                                            ) : (
                                                                <a 
                                                                    href={`mailto:${req.buyer_email}`} 
                                                                    className="w-full flex items-center justify-center space-x-2 bg-slate-100 text-slate-600 py-2.5 rounded-lg font-bold text-xs hover:bg-slate-200 transition-all"
                                                                >
                                                                    <span>✉️</span> <span>Email Buyer</span>
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Legacy Incoming View (Hidden if redundant, or keep for quick overview) */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Recent Buyer Interest</h2>
                    <div className="space-y-4">
                        {incomingRequests.length === 0 ? (
                            <p className="text-slate-500 italic text-sm">No requests yet.</p>
                        ) : (
                            incomingRequests.slice(0, 5).map(req => (
                                <div key={req.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                            {req.buyer_name ? req.buyer_name[0] : 'B'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{req.buyer_name}</p>
                                            <p className="text-[10px] text-slate-500">Interested in {req.listing_title}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${req.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {req.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sent Requests (As Buyer) */}
                <div className="glass-panel p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center">
                        <span className="bg-primary-light text-white p-1.5 rounded-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                            </svg>
                        </span>
                        My Sent Requests
                    </h2>
                    {sentRequests.length === 0 ? (
                        <p className="text-slate-500 italic text-sm">You haven't made any buy requests.</p>
                    ) : (
                        <div className="space-y-4">
                            {sentRequests.map(req => (
                                <div key={req.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <span className="font-bold text-slate-800">{req.listing_title || `Listing #${req.listing_id}`}</span>
                                            <p className="text-xs text-slate-400">Sent on {new Date(req.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    
                                    {req.seller_phone && (
                                        <a 
                                            href={`https://wa.me/${req.seller_phone.replace(/\D/g, '')}`} 
                                            target="_blank" 
                                            className="mt-2 flex items-center justify-center space-x-2 w-full bg-[#25D366] text-white py-2.5 rounded-lg hover:bg-[#128C7E] text-xs font-bold shadow-sm transition-all"
                                        >
                                            <span>💬</span> <span>WhatsApp Seller</span>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- App Container ---

const App = () => {
    const [page, setPage] = useState('home');
    const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <AuthProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
                <Navbar setPage={setPage} darkMode={darkMode} setDarkMode={setDarkMode} />
                <main>
                    {page === 'home' && <HomePage setPage={setPage} />}
                    {page === 'login' && <LoginPage setPage={setPage} />}
                    {page === 'register' && <RegisterPage setPage={setPage} />}
                    {page === 'create-listing' && <CreateListingPage setPage={setPage} />}
                    {page === 'create-website-listing' && <CreateWebsiteListingPage setPage={setPage} />}
                    {page === 'dashboard' && <DashboardPage />}
                </main>
            </div>
        </AuthProvider>
    );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
