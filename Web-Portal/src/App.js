import Registration from './Components/Registration/Registration';
import Home from './Components/Home/Home';
import Signin from './Components/Signin/Signin';
import About from './Components/About/About'
import Ebook from './Components/Ebook/Ebook'
import Book from './Components/Book/Book'
import Community from './Components/Community/Community'
import Popup from './Components/Popup/Popup'
import Issuedbooks from './Components/Issuedbooks/Issuedbooks';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Historybooks from './Components/Historybooks/Historybooks';
function App() {
  return (
    <div className="App" style={{margin:'0px', padding:'0px'}}>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Signin/>}/>
          <Route exact path="/Registration" element={<Registration/>}/>
          <Route exact path="/Home" element={<Home/>}/>
          <Route exact path="/About" element={<About/>}/>
          <Route exact path="/Ebook" element={<Ebook/>}/>
          <Route exact path="/Book" element={<Book/>}/>
          <Route exact path="/Community" element={<Community/>}/>
          <Route exact path="/Popup" element={<Popup/>}/>
          <Route exact path="/Issuedbooks" element={<Issuedbooks/>}/>
          <Route exact path="/history-issued-books" element={<Historybooks/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
