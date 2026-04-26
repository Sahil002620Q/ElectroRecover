const { useState, useEffect, createContext, useContext } = React;

// --- API Configuration ---
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://electro-recover-api.onrender.com';

const api = axios.create({
    baseURL: API_BASE_URL,
});

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
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

// --- Components ---

const Navbar = ({ setPage, darkMode, setDarkMode, openProfile }) => {
    const { user, logout } = useAuth();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setPage('home');
        setIsSettingsOpen(false);
    };

    const navigate = (p) => {
        setPage(p);
        setIsSettingsOpen(false);
    };

    const handleOpenProfile = () => {
        openProfile();
        setIsSettingsOpen(false);
    };

    return (
        <nav className="glass-panel sticky top-0 z-50 shadow-sm border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex cursor-pointer items-center" onClick={() => navigate('home')}>
                        <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
                            AssetSwap
                        </span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>

                            {isSettingsOpen && (
                                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl border border-white/20 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Settings</p>
                                    </div>

                                    <button
                                        onClick={() => setDarkMode(!darkMode)}
                                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-3">{darkMode ? '☀️' : '🌙'}</span>
                                            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                                        </div>
                                        <div className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? 'bg-primary' : 'bg-slate-300'}`}>
                                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${darkMode ? 'right-0.5' : 'left-0.5'}`}></div>
                                        </div>
                                    </button>

                                    {user && (
                                        <button
                                            onClick={handleOpenProfile}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <span className="mr-3">👤</span>
                                            <span>Profile Settings</span>
                                        </button>
                                    )}

                                    {user && user.role === 'admin' && (
                                        <button
                                            onClick={() => navigate('admin')}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-primary font-bold hover:bg-primary/5 transition-colors"
                                        >
                                            <span className="mr-3">🛡️</span>
                                            <span>Admin Panel</span>
                                        </button>
                                    )}

                                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                                    {user ? (
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                        >
                                            <span className="mr-3">🚪</span>
                                            <span>Logout</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate('login')}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <span className="mr-3">👤</span>
                                            <span>Login</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {user ? (
                            <button
                                onClick={() => navigate('dashboard')}
                                className="hidden md:flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-all"
                            >
                                <span>Dashboard</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('register')}
                                className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
                            >
                                Join Now
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2 pb-3 overflow-x-auto no-scrollbar scroll-smooth">
                    <button onClick={() => navigate('home')} className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700 shadow-sm">
                        Browse
                    </button>
                    {user && (
                        <>
                            <button onClick={() => navigate('create-listing')} className="flex-shrink-0 bg-primary text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-primary-dark shadow-md transition-all">
                                + Sell Item
                            </button>
                            <button onClick={() => navigate('create-website-listing')} className="flex-shrink-0 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-md">
                                🌐 Website
                            </button>
                            <button onClick={() => navigate('dashboard')} className="md:hidden flex-shrink-0 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
                                Dashboard
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

const ListingCard = ({ listing, onRequest, isRequested }) => {
    const defaultImage = "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&q=80"; // Default electronics parts image

    return (
        <div className="btn-animated bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl group">
            <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                <img
                    src={(listing.photos && listing.photos.length > 0) ? listing.photos[0] : defaultImage}
                    alt={listing.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
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
    const [confirmListing, setConfirmListing] = useState(null);

    const handleBuyRequest = (listingId) => {
        const listing = listings.find(l => l.id === listingId);
        setConfirmListing(listing);
    };

    const confirmBuy = async () => {
        if (!confirmListing) return;
        try {
            const res = await api.post('/requests/', { listing_id: confirmListing.id });
            setRequestedIds(prev => new Set([...prev, confirmListing.id]));
            setConfirmListing(null);
            alert("SUCCESS: Your request has been sent! Check the Dashboard to track it.");
        } catch (err) {
            const errorMsg = err.response?.data?.detail || "Failed to send request. You might need to login.";
            alert(errorMsg);
            if (err.response?.status === 401) setPage('login');
            setConfirmListing(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explore Marketplace</h1>
                    <p className="text-slate-500 mt-1">Find the best deals on broken electronics and websites</p>
                </div>

                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold text-slate-700 dark:text-slate-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <span>Filters</span>
                </button>
            </div>

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
                <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">No listings found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your filters to find what you're looking for.</p>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!confirmListing}
                onClose={() => setConfirmListing(null)}
                onConfirm={confirmBuy}
                title={confirmListing?.category === 'Website' ? 'Confirm Ownership Request' : 'Confirm Buy Request'}
                message={`Are you sure you want to request to ${confirmListing?.category === 'Website' ? 'acquire' : 'buy'} "${confirmListing?.title}" for $${confirmListing?.price}?`}
            />
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
            <div className="glass-panel p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-slate-800 dark:text-white">Welcome Back</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-3 transition-all"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-3 transition-all"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full btn-animated bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark shadow-lg">
                        Sign In
                    </button>
                </form>
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
                <h2 className="text-3xl font-bold mb-6 text-center text-slate-800 dark:text-white">Join the Market</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Full Name" required className="w-full rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <input type="email" placeholder="Email" required className="w-full rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <input type="tel" placeholder="Phone (for WhatsApp)" required className="w-full rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    <input type="password" placeholder="Password" required className="w-full rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    <select className="w-full rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                        value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                        <option value="buyer">I want to Buy</option>
                        <option value="seller">I want to Sell</option>
                    </select>
                    <input type="text" placeholder="Location" required className="w-full rounded-lg border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                        value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    <button type="submit" className="w-full btn-animated bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark shadow-lg mt-2">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

const CreateListingPage = ({ setPage }) => {
    const [formData, setFormData] = useState({ title: '', category: '', brand: '', model: '', condition: 'broken', price: '', location: '', description: '', photos: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/listings/', { ...formData, price: parseFloat(formData.price), photos: formData.photos ? [formData.photos] : [] });
            alert('Listing created!');
            setPage('dashboard');
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 dark:text-white">Create New Listing</h1>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 space-y-4">
                <input type="text" placeholder="Category (e.g. Phone)" required className="w-full border dark:border-slate-700 dark:bg-slate-800 p-3 rounded-xl"
                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                <input type="text" placeholder="Brand" className="w-full border dark:border-slate-700 dark:bg-slate-800 p-3 rounded-xl"
                    value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                <input type="text" placeholder="Title" required className="w-full border dark:border-slate-700 dark:bg-slate-800 p-3 rounded-xl"
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <textarea placeholder="Description" required className="w-full border dark:border-slate-700 dark:bg-slate-800 p-3 rounded-xl h-24"
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                <input type="number" placeholder="Price ($)" required className="w-full border dark:border-slate-700 dark:bg-slate-800 p-3 rounded-xl"
                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                <input type="text" placeholder="Location" required className="w-full border dark:border-slate-700 dark:bg-slate-800 p-3 rounded-xl"
                    value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />

                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl cursor-pointer">
                    <input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setFormData({ ...formData, photos: reader.result });
                            reader.readAsDataURL(file);
                        }
                    }} />
                </div>

                <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark font-bold shadow-lg">Post Listing</button>
            </form>
        </div>
    );
};

const CreateWebsiteListingPage = ({ setPage }) => {
    const [formData, setFormData] = useState({ title: '', category: 'Website', website_url: '', monthly_revenue: '', monthly_traffic: '', price: '', location: '', description: '', photos: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/listings/', { ...formData, price: parseFloat(formData.price), monthly_revenue: parseFloat(formData.monthly_revenue), monthly_traffic: parseInt(formData.monthly_traffic), condition: 'used', photos: formData.photos ? [formData.photos] : [] });
            alert('Website listed!');
            setPage('dashboard');
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.detail || err.message));
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 dark:text-white">Sell Your Website</h1>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 space-y-4">
                <input type="text" placeholder="Website Title" required className="w-full border dark:border-slate-700 dark:bg-slate-800 p-3 rounded-xl"
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                <input type="url" placeholder="URL" required className="w-full border dark:border-slate-700 dark:bg-slate-800 p-3 rounded-xl"
                    value={formData.website_url} onChange={e => setFormData({ ...formData, website_url: e.target.value })} />
                <input type="number" placeholder="Monthly Revenue" required className="w-full border dark:border-slate-700 dark:bg-slate-800 p-3 rounded-xl"
                    value={formData.monthly_revenue} onChange={e => setFormData({ ...formData, monthly_revenue: e.target.value })} />
                <input type="number" placeholder="Price" required className="w-full border dark:border-slate-700 dark:bg-slate-800 p-3 rounded-xl"
                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark font-bold shadow-lg">List Website</button>
            </form>
        </div>
    );
};

// --- Admin & Commission ---

const CommissionPopup = ({ amount, onCancel }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"></div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 border border-white/20 text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">💰</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Commission Due</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    You have an unpaid commission of <span className="font-bold text-slate-900 dark:text-white">${amount.toFixed(2)}</span>.
                    Please pay to unlock selling features.
                </p>
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl mb-6">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY_COMMISSION" className="mx-auto rounded-lg shadow-sm" alt="QR Code" />
                    <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">Scan to Pay 15% Fee</p>
                </div>
                <div className="space-y-3">
                    <p className="text-xs text-amber-600 font-medium">After payment, an Admin will verify and unlock your account.</p>
                    <button onClick={onCancel} className="w-full py-3 text-slate-500 font-bold hover:text-slate-800">Close</button>
                </div>
            </div>
        </div>
    );
};

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [stats, setStats] = useState({ total_users: 0, total_listings: 0, total_completed: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [uRes, lRes, sRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/listings'),
                api.get('/admin/stats')
            ]);
            setUsers(uRes.data);
            setListings(lRes.data);
            setStats(sRes.data);
            setLoading(false);
        } catch (err) {
            alert("Admin access denied");
        }
    };

    const deleteUser = async (id) => {
        if (confirm("Delete this user?")) {
            await api.delete(`/admin/users/${id}`);
            fetchAdminData();
        }
    };

    const deleteListing = async (id) => {
        if (confirm("Delete this listing?")) {
            await api.delete(`/admin/listings/${id}`);
            fetchAdminData();
        }
    };

    const verifyPayment = async (id) => {
        await api.put(`/admin/verify-payment/${id}`);
        fetchAdminData();
        alert("Payment verified! User unlocked.");
    };

    if (loading) return <div className="p-20 text-center">Loading Panel...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-black mb-8 dark:text-white">Admin Central</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-primary p-6 rounded-3xl text-white shadow-xl">
                    <p className="text-primary-light font-bold uppercase text-xs">Total Users</p>
                    <h3 className="text-4xl font-black">{stats.total_users}</h3>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
                    <p className="text-slate-500 font-bold uppercase text-xs">Active Listings</p>
                    <h3 className="text-4xl font-black">{stats.total_listings}</h3>
                </div>
                <div className="bg-green-500 p-6 rounded-3xl text-white shadow-xl">
                    <p className="text-green-200 font-bold uppercase text-xs">Completed Deals</p>
                    <h3 className="text-4xl font-black">{stats.total_completed}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-6 rounded-3xl">
                    <h3 className="text-xl font-bold mb-6">User Directory</h3>
                    <div className="space-y-4">
                        {users.map(u => (
                            <div key={u.id} className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div>
                                    <p className="font-bold">{u.name}</p>
                                    <p className="text-xs text-slate-500">{u.email} • {u.phone}</p>
                                    {u.has_unpaid_commission && <span className="text-[10px] text-amber-500 font-bold">⚠️ UNPAID: ${u.commission_due}</span>}
                                </div>
                                <div className="flex space-x-2">
                                    {u.has_unpaid_commission && (
                                        <button onClick={() => verifyPayment(u.id)} className="bg-green-500 text-white text-[10px] px-3 py-1 rounded-lg font-bold">Paid</button>
                                    )}
                                    <button onClick={() => deleteUser(u.id)} className="text-red-500 text-[10px] font-bold">Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl">
                    <h3 className="text-xl font-bold mb-6">Market Listings</h3>
                    <div className="space-y-4">
                        {listings.map(l => (
                            <div key={l.id} className="flex justify-between items-center p-4 bg-white/50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <p className="font-bold truncate max-w-[200px]">{l.title}</p>
                                <button onClick={() => deleteListing(l.id)} className="text-red-500 text-[10px] font-bold">Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Dashboard ---

const DashboardPage = () => {
    const { user } = useAuth();
    const [myListings, setMyListings] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [showCommission, setShowCommission] = useState(false);

    useEffect(() => {
        if (user) loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        try {
            const [reqSent, reqInc, listRes] = await Promise.all([
                api.get('/requests/my-requests'),
                api.get('/requests/incoming'),
                api.get('/listings/?limit=100')
            ]);
            setSentRequests(reqSent.data);
            setIncomingRequests(reqInc.data);
            setMyListings(listRes.data.filter(l => l.seller_id === user.id));
        } catch (err) { console.error(err); }
    };

    const handleUpdateStatus = async (reqId, status) => {
        try {
            if (status === 'accept') {
                if (user.has_unpaid_commission) { setShowCommission(true); return; }
                await api.put(`/requests/${reqId}/accept`);
            }
            if (status === 'reject') await api.put(`/requests/${reqId}/reject`);
            if (status === 'complete') await api.put(`/requests/${reqId}/complete`);
            loadDashboardData();
        } catch (err) {
            if (err.response?.status === 403) setShowCommission(true);
            else alert("Action failed");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {showCommission && <CommissionPopup amount={user.commission_due} onCancel={() => setShowCommission(false)} />}
            <h1 className="text-3xl font-bold mb-8 dark:text-white">Dashboard</h1>

            <div className="grid grid-cols-1 gap-8">
                {myListings.map(l => (
                    <div key={l.id} className="glass-panel p-6 rounded-3xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold">{l.title}</h3>
                                <p className="text-slate-500">${l.price} • {l.status}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {incomingRequests.filter(r => r.listing_id === l.id).map(req => (
                                <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{req.buyer_name}</p>
                                        <p className="text-xs text-slate-500">{req.status}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        {req.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(req.id, 'accept')} className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold">Accept</button>
                                                <button onClick={() => handleUpdateStatus(req.id, 'reject')} className="text-red-500 text-xs font-bold px-4 py-2">Reject</button>
                                            </>
                                        )}
                                        {req.status === 'accepted' && (
                                            <button onClick={() => handleUpdateStatus(req.id, 'complete')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Mark as Sold</button>
                                        )}
                                        {(req.status === 'accepted' || req.status === 'completed') && (
                                            <a href={`https://wa.me/${req.buyer_phone?.replace(/\D/g, '')}`} target="_blank" className="bg-[#25D366] text-white p-2 rounded-xl">💬</a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProfileUpdateModal = ({ isOpen, onClose, user, setUser }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        location: user?.location || ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/auth/me', formData);
            setUser(res.data);
            alert("Profile updated successfully!");
            onClose();
        } catch (err) {
            alert("Failed to update profile: " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold dark:text-white">Profile Settings</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 focus:ring-primary focus:border-primary border dark:text-white"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            required
                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 focus:ring-primary focus:border-primary border dark:text-white"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                        <input
                            type="text"
                            required
                            className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 focus:ring-primary focus:border-primary border dark:text-white"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 relative z-10 border border-white/20 animate-in zoom-in duration-200">
                <h3 className="text-xl font-bold mb-2 dark:text-white">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{message}</p>
                <div className="flex space-x-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const MainLayout = ({ page, setPage, darkMode, setDarkMode }) => {
    const { user, setUser } = useAuth();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-slate-900 dark:text-white font-sans transition-colors duration-300">
            <Navbar
                setPage={setPage}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                openProfile={() => setIsProfileModalOpen(true)}
            />
            <main>
                {page === 'home' && <HomePage setPage={setPage} />}
                {page === 'login' && <LoginPage setPage={setPage} />}
                {page === 'register' && <RegisterPage setPage={setPage} />}
                {page === 'create-listing' && <CreateListingPage setPage={setPage} />}
                {page === 'create-website-listing' && <CreateWebsiteListingPage setPage={setPage} />}
                {page === 'dashboard' && <DashboardPage />}
                {page === 'admin' && <AdminPanel />}
            </main>

            {user && (
                <ProfileUpdateModal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    user={user}
                    setUser={setUser}
                />
            )}
        </div>
    );
};

const App = () => {
    const [page, setPage] = useState('home');
    const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') ? localStorage.getItem('theme') === 'dark' : true);

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
            <MainLayout page={page} setPage={setPage} darkMode={darkMode} setDarkMode={setDarkMode} />
        </AuthProvider>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
