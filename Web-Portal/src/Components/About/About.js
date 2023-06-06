import React from 'react'
import './About.css'
import Header from '../Header/Header'
import { auth } from '../firebase';
import pic from "./tejasProfile.JPG";
import pic2 from "./nikunjProfile.jpg";
function About() {
  if(auth.currentUser!==null){
  return (
    <div className='container'>
      <div>
        {<Header />}
      </div>
      <div className="c1">
      <div className="about_sub_c">
          <div className="tejas">
              <img src={pic} alt="" className='passimg'/>
              <div className="content">
                <p><b>Name</b>: Tejas Chauhan</p>
                <p><b>ID</b>: 20DCS013</p>
                <p><b>Role</b>: Web Development</p>
                <p><b>Contact</b>: 20dcs013@charusat.edu.in</p>
              </div>
          </div>
          <div className="nikunj">
              <img src={pic2} alt="" className='passimg'/>
              <div className="content">
                <p><b>Name</b>: Nikunj Dave</p>
                <p><b>ID</b>: 20DCS015</p>
                <p><b>Role</b>: Internet of Things</p>
                <p><b>Contact</b>: 20dcs015@charusat.edu.in</p>
              </div> 
          </div>
      </div>
      </div>
      
    </div>
  )
}
}

export default About
