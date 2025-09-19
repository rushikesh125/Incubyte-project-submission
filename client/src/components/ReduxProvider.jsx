'use client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store/store';

import { Loader2 } from 'lucide-react';
import { useAuthValidation } from '@/hooks/useAuth';

function AuthValidator({ children }) {
  const { isValidating } = useAuthValidation();
  
  // Show loading while validating token
  if (isValidating) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
        <p className="text-gray-600">
          <Loader2 className='animate-spin'/>
          Validating your session...</p>
      </div>
    );
  }

  return children;
}
const ReduxProvider=({ children }) =>{
  return (
    <Provider store={store}>
      <PersistGate 
        loading={null} 
        persistor={persistor}
      >
        <AuthValidator>{children}</AuthValidator>
      </PersistGate>
    </Provider>
  );
}
export default ReduxProvider;