import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import apiService from '../services/apiService';

const Sidebar = ({ userType = 'customer', user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [customerMenuItems, setCustomerMenuItems] = useState([]);
  const [userRole, setUserRole] = useState(null);

  // Base menu items for customers - MUST match role permissions exactly
  const baseCustomerMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/dashboard', permission: 'dashboard' },
    { id: 'products', label: 'Products', icon: '📦', path: '/products', permission: 'products' },
    { id: 'order-to-cash', label: 'Order to Cash', icon: '💰', path: '/order-to-cash', permission: 'orders' },
    { id: 'meeting-minutes', label: 'Meeting Minutes', icon: '📝', path: '/meeting-minutes', permission: 'meetings' },
    { id: 'market-report', label: 'Market Report', icon: '📊', path: '/market-report', permission: 'market_reports' },
    // { id: 'payment-info', label: 'Payment Info', icon: '💳', path: '/payment-info', permission: 'payments' }
  ];

  // Load user role and filter menu items based on permissions
  useEffect(() => {
    console.log('\n=== SIDEBAR USEEFFECT TRIGGERED ===');
    console.log('userType:', userType);
    console.log('user object:', user);
    console.log('user exists:', !!user);
    console.log('user.role_id:', user?.role_id);
    console.log('user.userRole:', user?.userRole);
    console.log('user.permissions:', user?.permissions);
    
    const loadUserRole = async () => {
      console.log('\n--- LOAD USER ROLE FUNCTION CALLED ---');
      
      if (userType === 'customer' && user) {
        console.log('✓ Processing customer user for menu permissions...');
        console.log('✓ User object details:', {
          id: user.id,
          username: user.username,
          role: user.role,
          role_id: user.role_id,
          hasUserRole: !!user.userRole,
          hasPermissions: !!user.permissions
        });
        
        try {
          let roleData = null;
          
          // Try to get role from user.userRole first (if already loaded in login)
          if (user.userRole && user.userRole.permissions) {
            console.log('✓ Found userRole in user object from login:', user.userRole);
            roleData = user.userRole;
          } 
          // Otherwise, fetch role permissions using the dedicated user endpoint
          else if (user.role_id) {
            console.log('✓ User has role_id, fetching permissions via user endpoint:', user.role_id);
            
            try {
              const response = await apiService.getMyRolePermissions();
              console.log('✓ My role permissions response:', response);
              
              if (response && response.success && response.data) {
                if (response.data.hasRole && response.data.role) {
                  roleData = response.data.role;
                  console.log('✓ Extracted role data from my-role-permissions:', roleData);
                } else {
                  console.log('⚠️ User has no active role or permissions:', response.data.message);
                  // Show default menus for users without roles
                  setCustomerMenuItems(baseCustomerMenuItems);
                  return;
                }
              } else {
                console.log('❌ Unexpected response from my-role-permissions:', response);
              }
              
              // Validate permissions structure
              if (roleData && roleData.permissions) {
                console.log('✓ Permissions found in role data:', roleData.permissions);
                console.log('✓ Permissions type:', typeof roleData.permissions);
                
                // If permissions is a string, try to parse it
                if (typeof roleData.permissions === 'string') {
                  try {
                    const parsed = JSON.parse(roleData.permissions);
                    roleData.permissions = parsed;
                    console.log('✓ Parsed permissions from string:', roleData.permissions);
                  } catch (parseError) {
                    console.error('❌ Failed to parse permissions string:', parseError);
                    console.error('❌ Permissions string was:', roleData.permissions);
                    roleData = null;
                  }
                }
                
                // Validate that permissions has the expected structure
                if (roleData && roleData.permissions && typeof roleData.permissions === 'object') {
                  console.log('✓ Permissions object validated');
                  
                  // Check if any of our expected permissions exist
                  const expectedPermissions = ['dashboard', 'products', 'orders', 'meetings', 'market_reports', 'payments'];
                  const foundPermissions = expectedPermissions.filter(perm => {
                    const permission = roleData.permissions[perm];
                    return permission && permission.view === true;
                  });
                  console.log('✓ Found permissions with view=true:', foundPermissions);
                  
                  if (foundPermissions.length === 0) {
                    console.log('⚠️ No view permissions enabled for any modules');
                    console.log('⚠️ Available permission keys:', Object.keys(roleData.permissions));
                    console.log('⚠️ Permission details:', roleData.permissions);
                  }
                } else {
                  console.log('❌ Permissions object validation failed');
                }
              } else {
                console.log('❌ No permissions found in role data');
                console.log('❌ roleData:', roleData);
              }
            } catch (apiError) {
              console.error('❌ API error fetching role permissions:', apiError);
              console.log('⚠️ Falling back to default customer menus due to API error');
              
              // If API fails, show default menus
              setCustomerMenuItems(baseCustomerMenuItems);
              return; // Exit early with default menus
            }
          }
          // Check if user object has permissions directly
          else if (user.permissions) {
            console.log('✓ Found permissions directly in user:', user.permissions);
            roleData = { permissions: user.permissions };
          } else {
            console.log('❌ No role_id, userRole, or permissions found in user object');
            console.log('❌ User object keys:', Object.keys(user));
          }
          
          if (roleData && roleData.permissions) {
            console.log('✅ ROLE DATA FOUND - permissions:', roleData.permissions);
            setUserRole(roleData);
            filterMenuByPermissions(roleData.permissions);
          } else {
            console.log('❌ NO PERMISSIONS FOUND - showing empty menu');
            setCustomerMenuItems([]);
          }
        } catch (error) {
          console.error('❌ Error loading user role:', error);
          setCustomerMenuItems([]);
        }
      } else if (userType === 'customer') {
        console.log('❌ Customer user type but no user data');
        setCustomerMenuItems([]);
      } else {
        console.log('ℹ️ Not customer user type, skipping menu setup');
      }
    };

    console.log('\n--- CHECKING CONDITIONS ---');
    console.log('userType === "customer":', userType === 'customer');
    console.log('Will call loadUserRole:', userType === 'customer');
    
    if (userType === 'customer') {
      console.log('✓ Calling loadUserRole()...');
      loadUserRole();
    } else {
      console.log('❌ Not calling loadUserRole - userType is:', userType);
    }
  }, [userType, user]);

  const filterMenuByPermissions = (permissions) => {
    console.log('\n=== FILTERING MENUS BY PERMISSIONS ===');
    console.log('Permissions object received:', permissions);
    console.log('Base menu items to filter:', baseCustomerMenuItems.map(item => `${item.label} (${item.permission})`));
    
    const filteredItems = baseCustomerMenuItems.filter(item => {
      console.log(`\n--- Checking: ${item.label} (permission: ${item.permission}) ---`);
      
      // Check if the module has view permission
      const modulePermissions = permissions[item.permission];
      console.log(`Permissions for '${item.permission}':`, modulePermissions);
      
      let hasPermission = false;
      
      if (modulePermissions && typeof modulePermissions === 'object') {
        // Standard structure: { view: true, create: false, ... }
        hasPermission = modulePermissions.view === true;
        console.log(`\u2192 view property: ${modulePermissions.view}`);
        console.log(`\u2192 has permission: ${hasPermission}`);
      } else if (modulePermissions === true) {
        // Handle boolean permission
        hasPermission = true;
        console.log(`\u2192 boolean permission: true`);
      } else {
        console.log(`\u2192 No valid permissions (type: ${typeof modulePermissions}, value: ${modulePermissions})`);
        hasPermission = false;
      }
      
      console.log(`\u2713 RESULT for ${item.label}: ${hasPermission ? 'SHOW' : 'HIDE'}`);
      return hasPermission;
    });
    
    console.log('\n=== FILTERING COMPLETE ===');
    console.log('Filtered menu items:', filteredItems.map(item => item.label));
    console.log('Number of visible menus:', filteredItems.length);
    
    setCustomerMenuItems(filteredItems);
    console.log('Customer menu items state updated!');
  };

  const adminMenuItems = [
    { 
      id: 'admin-dashboard', 
      label: 'Admin Dashboard', 
      icon: '🏠', 
      path: '/admin/dashboard',
      section: 'Main'
    },
    { 
      id: 'user-management', 
      label: 'User Management', 
      icon: '👥',
      path: '/admin/users',
      section: 'Admin Tools'
    },
    { 
      id: 'role-management', 
      label: 'Role Management', 
      icon: '🔐',
      path: '/admin/roles',
      section: 'Admin Tools'
    },
    { 
      id: 'products', 
      label: 'Product Management', 
      icon: '📦',
      path: '/admin/products',
      section: 'Business Operations'
    },
    { 
      id: 'order-to-cash-admin', 
      label: 'Order To Cash', 
      icon: '💰',
      path: '/admin/orders',
      section: 'Business Operations'
    },
    { 
      id: 'invoice-to-delivery', 
      label: 'Invoice to Delivery', 
      icon: '🚚',
      path: '/admin/invoice-to-delivery',
      section: 'Business Operations'
    },
    { 
      id: 'meeting-minutes-admin', 
      label: 'Meeting Minutes', 
      icon: '📝',
      path: '/admin/meeting-minutes',
      section: 'Business Operations'
    },
    { 
      id: 'market-report', 
      label: 'Market Reports', 
      icon: '📊',
      path: '/market-report',
      section: 'Business Operations'
    },
    // { 
    //   id: 'payment-info-admin', 
    //   label: 'Payment Information', 
    //   icon: '💳',
    //   path: '/admin/payments',
    //   section: 'Business Operations'
    // },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: '⚙️',
      path: '/admin/settings',
      section: 'System'
    }
  ];

  const menuItems = userType === 'admin' ? adminMenuItems : customerMenuItems;

  // Debug logging for menu items
  console.log('\n=== SIDEBAR RENDER DEBUG ===');
  console.log('userType:', userType);
  console.log('customerMenuItems state:', customerMenuItems);
  console.log('final menuItems for render:', menuItems);
  console.log('menuItems.length:', menuItems.length);

  const isActive = (itemPath) => {
    // Check if current path matches or starts with the item path
    if (itemPath === '/admin/roles' && location.pathname.startsWith('/admin/roles')) {
      return true;
    }
    if (itemPath === '/admin/products' && location.pathname.startsWith('/admin/products')) {
      return true;
    }
    if (itemPath === '/admin/settings' && location.pathname.startsWith('/admin/settings')) {
      return true;
    }
    return location.pathname === itemPath;
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const renderMenuItem = (item) => (
    <li key={item.id} className="nav-item">
      <button
        className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
        onClick={() => handleNavigation(item.path)}
      >
        <span className="nav-icon">{item.icon}</span>
        <span className="nav-label">{item.label}</span>
      </button>
    </li>
  );

  const renderAdminMenu = () => {
    const sections = {};
    adminMenuItems.forEach(item => {
      const section = item.section || 'Main';
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(item);
    });

    return Object.entries(sections).map(([sectionName, items]) => (
      <div key={sectionName} className="nav-section">
        {sectionName !== 'Main' && (
          <div className="section-header">{sectionName}</div>
        )}
        <ul className="nav-list">
          {items.map(renderMenuItem)}
        </ul>
      </div>
    ));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>{userType === 'admin' ? 'Admin Panel' : 'Customer Portal'}</h3>
      </div>
      <nav className="sidebar-nav">
        {userType === 'admin' ? (
          renderAdminMenu()
        ) : (
          <div>
            {/* Role-based menu display - only show explicitly permitted menus */}
            {(() => {
              console.log('Final render check - customerMenuItems:', customerMenuItems);
              console.log('Final render check - menuItems:', menuItems);
              
              return menuItems.length > 0 ? (
                <ul className="nav-list">
                  {menuItems.map(renderMenuItem)}
                </ul>
              ) : (
                <div className="no-permissions-message">
                  <p>No menu items available.</p>
                  <p>Please contact your administrator for access permissions.</p>
                  
                  {/* Enhanced Debug Panel */}
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f8f9fa', 
                    border: '1px solid #dee2e6',
                    borderRadius: '5px',
                    fontSize: '12px', 
                    color: '#495057',
                    textAlign: 'left'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Debug Information:</h4>
                    <div><strong>User Type:</strong> {userType}</div>
                    <div><strong>User Present:</strong> {user ? 'Yes' : 'No'}</div>
                    <div><strong>User Role ID:</strong> {user?.role_id || 'Not assigned'}</div>
                    <div><strong>Customer Menu Items Length:</strong> {customerMenuItems.length}</div>
                    
                    {user?.role_id && (
                      <div>
                        <div style={{ marginTop: '10px' }}><strong>Role Data:</strong></div>
                        <div>UserRole in User: {user.userRole ? 'Present' : 'Missing'}</div>
                        <div>Direct Permissions: {user.permissions ? 'Present' : 'Missing'}</div>
                      </div>
                    )}
                    
                    {userRole && (
                      <div>
                        <div style={{ marginTop: '10px' }}><strong>Loaded Role Permissions:</strong></div>
                        <pre style={{ 
                          fontSize: '10px', 
                          backgroundColor: '#e9ecef', 
                          padding: '5px', 
                          borderRadius: '3px',
                          overflow: 'auto',
                          maxHeight: '150px'
                        }}>
                          {JSON.stringify(userRole.permissions, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <div style={{ marginTop: '10px', fontSize: '11px', fontStyle: 'italic' }}>
                      Open Browser Console (F12) for detailed logs
                    </div>
                  </div>
                </div>
              );
            })()} 
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
