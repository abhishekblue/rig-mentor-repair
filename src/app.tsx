import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./components/HomePage"
import FullRepairForm from "./components/FullRepairForm"

function App() {
  return (
    <Router basename="/repair">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/form" element={<FullRepairForm />} />
      </Routes>
    </Router>
  )
}

export default App
