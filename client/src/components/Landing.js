import React from 'react'

const Landing = () => {
    return (
        <section className="landing">
            <div className="dark-overlay">
                <div className="landing-inner">
                    <h1 className="X-large">Socialability</h1>
                    <p className="lead">
                        Create a profile/portfolio, share posts, and connect with other people.
                    </p>
                    <div className="button">
                        <a href="sign-up.html" className="btn btn-primary">Sign Up</a>
                        <a href="login.html" className="btn btn-primary">Login</a>
                    </div>
                </div>
            </div >
        </section >
    )
}

export default Landing
