import Home from './components/home/Home';
import Login from './components/home/Login';
import AdminLogin from './components/pages/AdminLogin';
import ManufacturerLogin from './components/pages/ManufacturerLogin';
import RetailerLogin from './components/pages/RetailerLogin';
import ConsumerLogin from './components/pages/ConsumerLogin';
import Consumer from './components/pages/Consumer';
import ScannerPage from './components/pages/ScannerPage';
import Admin from './components/pages/Admin';
import Manufacturer from './components/pages/Manufacturer';
import Supplier from './components/pages/Supplier';
import Retailer from './components/pages/Retailer';
import { Routes, Route } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import Layout from './components/Layout';
import AddAccount from './components/pages/AddAccount';
import ManageAccount from './components/pages/ManageAccount';
import AddProduct from './components/pages/AddProduct';
import Profile from './components/pages/Profile';
import UpdateProduct from './components/pages/UpdateProduct';
import Product from './components/pages/Product';
import AuthenticProduct from './components/pages/AuthenticProduct';
import FakeProduct from './components/pages/FakeProduct';
import UpdateProductDetails from './components/pages/UpdateProductDetails';
import CompanyDetails from './components/pages/CompanyDetails';
import ViewProducts from './components/pages/ViewProducts';
import ManufacturerComplaints from './components/pages/ManufacturerComplaints';
import RetailerProducts from './components/pages/RetailerProducts';
import { Box } from '@mui/material';

function App() {

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100vw', 
      overflowX: 'hidden',
      margin: 0,
      padding: 0
    }}>
    <Routes>
      <Route path='/' element={<Layout />}>

        {/* public routes */}
        <Route exact path='/' element={< Home />}></Route>
        <Route exact path='/login' element={< Login />}></Route>
        <Route exact path='/login/admin' element={< AdminLogin />}></Route>
        <Route exact path='/login/manufacturer' element={< ManufacturerLogin />}></Route>
        <Route exact path='/login/retailer' element={< RetailerLogin />}></Route>
        <Route exact path='/login/consumer' element={< ConsumerLogin />}></Route>
        <Route exact path='/scanner' element={< ScannerPage />}></Route>
        <Route exact path='/product' element={< Product />}></Route>
        <Route exact path='/authentic-product' element={< AuthenticProduct />}></Route>
        <Route exact path='/fake-product' element={< FakeProduct />}></Route>

        {/* private routes */}
        <Route element={<RequireAuth allowedRoles={["admin"]} />}>
          <Route exact path='/admin' element={< Admin />}></Route>
          <Route exact path='/add-account' element={< AddAccount />}></Route>
          <Route exact path='/manage-account' element={< ManageAccount />}></Route>
          <Route exact path='/company-details/:username' element={< CompanyDetails />}></Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={["manufacturer", "supplier", "retailer"]} />}>
          <Route exact path='/profile' element={< Profile />}></Route>
          <Route exact path='/update-product' element={< UpdateProduct />}></Route>
          <Route exact path='/update-product-details' element={< UpdateProductDetails />}></Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={["supplier", "retailer"]} />}>
          <Route exact path='/update-product' element={< UpdateProduct />}></Route>
          <Route exact path='/update-product-details' element={< UpdateProductDetails />}></Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={["manufacturer"]} />}>
          <Route exact path='/manufacturer' element={< Manufacturer />}></Route>
          <Route exact path='/add-product' element={< AddProduct />}></Route>
          <Route exact path='/view-products' element={< ViewProducts />}></Route>
          <Route exact path='/manufacturer-complaints' element={< ManufacturerComplaints />}></Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={["supplier"]} />}>
          <Route exact path='/supplier' element={< Supplier />}></Route>        
        </Route>

        <Route element={<RequireAuth allowedRoles={["retailer"]} />}>
          <Route exact path='/retailer' element={< Retailer />}></Route>
          <Route exact path='/retailer-products' element={< RetailerProducts />}></Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={["consumer"]} />}>
          <Route exact path='/consumer' element={< Consumer />}></Route>
          <Route exact path='/consumer/products/:serialNumber' element={< Product />}></Route>
        </Route>

        {/* catch all */}
        {/* <Route path='*' element={< Missing />}></Route> */}

      </Route>
    </Routes>
    </Box>

  );
}

export default App;
