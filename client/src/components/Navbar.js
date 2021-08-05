import React from 'react'

const Navbar = () => {
    return (
        <nav class="navbar bg-dark">
            <h1>
                <a href="index.html"><i class="fas fa-hands-helping"> Connect With People</i></a>
            </h1>
            <ul>
                <li><a href="people.html">People</a></li>
                <li><a href="sign-up.html">Sign Up</a></li>
                <li><a href="login.html">Login</a></li>
            </ul>
        </nav>
    )
}
export default Navbar
