import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './styles/App.css';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProductCatalogue from './components/ProductCatalogue';
import ProductDetails from './components/ProductDetails';
import OrderToCash from './components/OrderToCash';
import MinutesOfMeeting from './components/MinutesOfMeeting';
import MarketReport from './components/MarketReport';
import ProductForm from './components/ProductForm';
import apiService from './services/apiService';

// Admin Components
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import AddUser from './components/AddUser';
import EditUser from './components/EditUser';
import RoleList from './components/RoleList';
import CreateRoleNew from './components/CreateRoleNew';
import EditRole from './components/EditRole';
import ViewRole from './components/ViewRole';
import MeetingMinutesManagement from './components/MeetingMinutesManagement';
import PaymentInfoManagement from './components/PaymentInfoManagement';
import StatementList from './components/StatementList';
import StatementDetails from './components/StatementDetails';
import OrderToCashManagement from './components/OrderToCashManagement';
import InvoiceToDeliveryManagement from './components/InvoiceToDeliveryManagement';

// Meeting Minutes Components
import MeetingMinutesList from './components/MeetingMinutes/MeetingMinutesList';
import AddMeetingMinutes from './components/MeetingMinutes/AddMeetingMinutes';
import EditMeetingMinutes from './components/MeetingMinutes/EditMeetingMinutes';
import ViewMeetingMinutes from './components/MeetingMinutes/ViewMeetingMinutes';

// Market Research Components
import MarketResearchList from './components/MarketResearch/MarketResearchList';
import AddMarketResearch from './components/MarketResearch/AddMarketResearch';
import EditMarketResearch from './components/MarketResearch/EditMarketResearch';
import ViewMarketResearch from './components/MarketResearch/ViewMarketResearch';

// Product Management Components
import ProductList from './components/ProductList';
import CreateProduct from './components/CreateProduct';
import EditProduct from './components/EditProduct';
import ViewProduct from './components/ViewProduct';

// Order and Invoice View Components
import ViewOrder from './components/ViewOrder';
import ViewInvoiceToDelivery from './components/ViewInvoiceToDelivery';

// Settings Component
import Settings from './components/Settings';
import AddSocialMedia from './components/AddSocialMedia';
import EditSocialMedia from './components/EditSocialMedia';

// Customer Components
import CustomerPaymentInfo from './components/customer/CustomerPaymentInfo';
import CustomerProductView from './components/customer/CustomerProductView';
import CustomerProducts from './components/CustomerProducts';
import CustomerProductView2 from './components/CustomerProductView';
import CustomerViewOrder from './components/customer/CustomerViewOrder';
import CustomerViewMeetingMinutes from './components/customer/CustomerViewMeetingMinutes';
import CustomerViewMarketReport from './components/customer/CustomerViewMarketReport';
import CustomerViewPaymentDetails from './components/customer/CustomerViewPaymentDetails';
import CustomerInvoiceToDelivery from './components/customer/CustomerInvoiceToDelivery';
import NewsDetail from './components/NewsDetail';

// News Management Components
import NewsList from './components/NewsList';
import NewsForm from './components/NewsForm';

// Protected Route Component
const ProtectedRoute = ({ children, isLoggedIn, userType, requiredUserType, requiredPermission, user }) => {

  console.log("\n=== PROTECTED ROUTE CHECK ===");
  console.log("Required Permission:", requiredPermission);
  console.log("User Type:", userType);
  console.log("User Object:", user);
  console.log("Current Path:", window.location.pathname);
  
  if (!isLoggedIn) {
    console.log("❌ User not logged in, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  if (requiredUserType && userType !== requiredUserType) {
    console.log("❌ User type mismatch, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  // For customer users with permission requirements
  if (userType === 'customer' && requiredPermission && user) {
    console.log("\n--- CUSTOMER PERMISSION CHECK ---");
    console.log("User Role ID:", user.role_id);
    console.log("Checking permission:", requiredPermission);
    
    let userPermissions = null;
    
    // Get permissions from user object
    if (user.userRole && user.userRole.permissions) {
      userPermissions = user.userRole.permissions;
      console.log("✓ Found permissions in user.userRole:", userPermissions);
    } else if (user.permissions) {
      userPermissions = user.permissions;
      console.log("✓ Found permissions in user.permissions:", userPermissions);
    } else {
      console.log("❌ No permissions found in user object");
    }
    
    // If no role_id, show role assignment required
    if (!user.role_id) {
      console.log('❌ Customer has no role_id assigned');
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2>Role Assignment Required</h2>
          <p>Your account does not have a specific role assigned.</p>
          <p>Please contact your administrator to assign a role with appropriate permissions.</p>
          <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            <p><strong>Account Info:</strong></p>
            <p>Username: {user.username}</p>
            <p>Role Type: {user.role}</p>
            <p>Role ID: {user.role_id || 'Not assigned'}</p>
          </div>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Login
          </button>
        </div>
      );
    }
    
    // If permissions are not loaded yet, allow access with warning
    if (!userPermissions) {
      console.log('⚠️ Permissions not loaded yet, allowing access temporarily');
      
      // Show a warning banner but allow access
      return (
        <div>
          <div style={{
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '0.75rem 1.25rem',
            marginBottom: '1rem',
            border: '1px solid #ffeaa7',
            borderRadius: '0.25rem'
          }}>
            ⚠️ Permissions are loading... If you see limited functionality, please refresh the page.
          </div>
          {children}
        </div>
      );
    }
    
    // Check if user has the required permission
    console.log("\n--- PERMISSION VALIDATION ---");
    console.log("Looking for permission:", requiredPermission);
    console.log("Available permissions:", Object.keys(userPermissions));
    console.log("Permission value:", userPermissions[requiredPermission]);
    
    const hasPermission = userPermissions[requiredPermission] && 
                         typeof userPermissions[requiredPermission] === 'object' &&
                         userPermissions[requiredPermission].view === true;
    
    console.log("Has permission:", hasPermission);
    
    if (hasPermission) {
      console.log("✅ Permission granted, allowing access");
      return children;
    } else {
      console.log("❌ Permission denied, checking for fallback options");
      
      // Instead of redirecting, show permission denied with debug info
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access the {requiredPermission} module.</p>
          <p>Please contact your administrator for access to this feature.</p>
          
          {/* Debug Information */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '5px',
            fontSize: '12px',
            color: '#495057',
            textAlign: 'left',
            maxWidth: '500px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Debug Information:</h4>
            <div><strong>Required Permission:</strong> {requiredPermission}</div>
            <div><strong>User Role ID:</strong> {user.role_id}</div>
            <div><strong>Available Permissions:</strong></div>
            <pre style={{
              fontSize: '10px',
              backgroundColor: '#e9ecef',
              padding: '5px',
              borderRadius: '3px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {JSON.stringify(userPermissions, null, 2)}
            </pre>
          </div>
          
          <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      );
    }
  }
  
  console.log("✅ All checks passed, allowing access");
  return children;
};

// Layout Component for authenticated pages
const AppLayout = ({ children, userType, user, onLogout }) => {
  console.log('\n=== APP LAYOUT RENDER ===');
  console.log('AppLayout userType:', userType);
  console.log('AppLayout user:', user);
  console.log('AppLayout user.role_id:', user?.role_id);
  
  return (
    <div className="App">
      <Header userType={userType} user={user} onLogout={onLogout} />
      <div className="app-layout">
        <Sidebar userType={userType} user={user} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('customer');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // You can add a token validation API call here
          // const userData = await apiService.validateToken();
          setIsLoggedIn(true);
          
          // Try to get user data from localStorage or make an API call
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setUserType(userData.type || userData.role || 'customer');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    console.log('\n=== HANDLE LOGIN CALLED ===');
    console.log('Raw login userData received:', userData);
    console.log('userData.role_id:', userData.role_id);
    console.log('userData.type:', userData.type);
    console.log('userData.role:', userData.role);
    
    setIsLoggedIn(true);
    setUserType(userData.type || userData.role || 'customer');
    setUser(userData);
    
    console.log('✓ State updated:');
    console.log('  - isLoggedIn: true');
    console.log('  - userType:', userData.type || userData.role || 'customer');
    console.log('  - user state set to:', userData);
    
    // Store user data and token
    if (userData.token) {
      apiService.setToken(userData.token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('✓ Token and localStorage updated');
    
    // Navigate to appropriate page
    if (userData.type === 'admin' || userData.role === 'admin') {
      console.log('✓ Navigating to admin dashboard');
      navigate('/admin/dashboard');
    } else {
      console.log('✓ Navigating to customer dashboard');
      // For customers, try dashboard first, then check permissions if needed
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setIsLoggedIn(false);
    setUserType('customer');
    setUser(null);
    
    // Clear stored data
    localStorage.removeItem('user');
    apiService.setToken(null);
    
    navigate('/login');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isLoggedIn ? (
            <Navigate to={userType === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        } 
      />
      
      {/* Root redirect */}
      <Route 
        path="/" 
        element={
          isLoggedIn ? (
            userType === 'admin' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              // For customers, redirect to first available menu item
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Customer Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredPermission="dashboard" user={user}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <Dashboard userType={userType} user={user} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/news/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <NewsDetail user={user} userType={userType} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/products" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredPermission="products" user={user}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <ProductCatalogue userType={userType} user={user} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/products/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <ViewProduct userType={userType} user={user} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/order-to-cash" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredPermission="orders" user={user}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <OrderToCash userType={userType} user={user} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/order-details/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredPermission="orders" user={user}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <CustomerViewOrder userType={userType} user={user} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/meeting-minutes" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredPermission="meetings" user={user}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <MinutesOfMeeting userType={userType} user={user} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/meeting-details/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredPermission="meetings" user={user}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              {userType === 'admin' ? <ViewMeetingMinutes userType={userType} user={user} /> : <CustomerViewMeetingMinutes userType={userType} user={user} />}
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/market-report-details/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredPermission="market_reports" user={user}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <CustomerViewMarketReport userType={userType} user={user} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/payment-details/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredPermission="payments" user={user}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <CustomerViewPaymentDetails userType={userType} user={user} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/market-report" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredPermission="market_reports" user={user}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              {userType === 'admin' ? <MarketResearchList /> : <MarketReport userType={userType} user={user} />}
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/market-report/add" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <AddMarketResearch />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/market-report/edit/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <EditMarketResearch />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/market-report/view/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <ViewMarketResearch />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/payment-info" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredPermission="payments" user={user}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              {userType === 'customer' ? <CustomerPaymentInfo userType={userType} user={user} /> : <div className="page-content"><h2>Payment Info</h2></div>}
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/invoice-to-delivery" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredPermission="invoice_to_delivery" user={user}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <CustomerInvoiceToDelivery user={user} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <UserManagement />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/users/create" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <AddUser />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/users/:id/edit" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <EditUser />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/roles" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <RoleList />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/roles/create" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <CreateRoleNew />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/roles/:id/edit" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <EditRole />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/roles/:id/view" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <ViewRole />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/products" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <ProductList userType={userType} user={user} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/products/create" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <CreateProduct />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/products/:id/edit" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <EditProduct />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/products/:id/view" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <ViewProduct userType={userType} user={user} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/orders" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <OrderToCashManagement />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/orders/view/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <ViewOrder />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/invoice-to-delivery" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <InvoiceToDeliveryManagement />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/invoice-to-delivery/view/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <ViewInvoiceToDelivery />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/meeting-minutes" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <MeetingMinutesList />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/meeting-minutes/add" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <AddMeetingMinutes />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/meeting-minutes/edit/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <EditMeetingMinutes />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/meeting-minutes/view/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <ViewMeetingMinutes />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/payments" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <StatementList />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/payments/statement/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <StatementDetails />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/settings/social-media/add" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <AddSocialMedia />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/settings/social-media/edit/:id" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <EditSocialMedia />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* News Management Routes */}
      <Route 
        path="/admin/news" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <NewsList />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/news/create" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <NewsForm mode="create" />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/news/:id/edit" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <NewsForm mode="edit" />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/news/:id/view" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} userType={userType} requiredUserType="admin">
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <NewsDetail user={user} userType={userType} />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* Product Form Route */}
      <Route 
        path="/product-form" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <AppLayout userType={userType} user={user} onLogout={handleLogout}>
              <ProductForm />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* Catch all route - redirect to appropriate dashboard or login */}
      <Route 
        path="*" 
        element={
          <Navigate to={isLoggedIn ? (userType === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login'} replace />
        } 
      />
    </Routes>
  );
}

export default App;
