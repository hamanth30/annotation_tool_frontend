import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './components/login'
import AdminDashboard from './pages/AdminDashboard'
import NewUser from './components/admin/NewUser'
import NewProject from './components/admin/NewProject'
import EditRole from './components/admin/EditRole'
import DrawRect from './components/annotator/DrawRect'
//import AnnotationPage from './components/annotator/AnnotationPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
   
        <AdminDashboard/>
     
    </div>
  )
}

export default App
