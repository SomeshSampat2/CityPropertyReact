import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../services/authService';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import '../styles/styles.css';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();

                        // Check for return URL parameter
                        const urlParams = new URLSearchParams(window.location.search);
                        const returnUrl = urlParams.get('returnUrl');

                        if (returnUrl) {
                            console.log('Redirecting to return URL:', returnUrl);
                            navigate(decodeURIComponent(returnUrl));
                            return;
                        }

                        // Default redirect logic based on profile completion
                        if (!userData.name || !userData.mobile) {
                            navigate('/profile');
                        } else {
                            navigate('/home');
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    navigate('/profile'); // Default to profile on error
                }
            }
        });

        return unsubscribe;
    }, [navigate]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
            // Navigation will be handled by the useEffect above
        } catch (error) {
            console.error('Sign in failed:', error);
            setIsLoading(false);
        }
    };

    return (
        <div id="login-container" style={{
            background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80") no-repeat center center fixed',
            backgroundSize: 'cover',
            color: '#ffffff'
        }}>
            {/* Add navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark">
                <div className="container">
                    <a className="navbar-brand fw-bold" href="#" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem' }}>
                        CityProperty
                    </a>
                </div>
            </nav>

            {/* Hero section */}
            <section className="vh-100 d-flex align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 text-center animate__animated animate__fadeInDown">
                            <h1 className="display-2 fw-bold mb-4" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)' }}>
                                Discover Your Dream Property
                            </h1>
                            <p className="lead mb-5 fs-4">
                                Premium real estate platform with role-based management and exclusive listings
                            </p>
                            <button
                                id="google-signin-btn"
                                className="btn btn-lg text-white shadow-lg animate__animated animate__pulse animate__infinite"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                style={{
                                    background: 'var(--primary-gradient)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.75rem 2rem'
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <i className="fab fa-google me-2"></i> Sign in with Google
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features section */}
            <section className="py-5 bg-gradient" style={{ background: 'var(--dark-gradient)' }}>
                <div className="container">
                    <h2 className="text-center mb-5 fs-1 fw-bold">Why Choose CityProperty?</h2>
                    <div className="row g-4 justify-content-center">
                        <div className="col-md-4">
                            <div className="card glass shadow-lg h-100 animate__animated animate__fadeInLeft">
                                <div className="card-body text-center p-4">
                                    <i className="fas fa-home fa-3x mb-3 text-primary"></i>
                                    <h5 className="card-title fs-4">Luxury Properties</h5>
                                    <p className="card-text">Browse thousands of premium listings with detailed features and high-res images.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card glass shadow-lg h-100 animate__animated animate__fadeInUp">
                                <div className="card-body text-center p-4">
                                    <i className="fas fa-users fa-3x mb-3 text-primary"></i>
                                    <h5 className="card-title fs-4">Role-Based Access</h5>
                                    <p className="card-text">From browsers to brokers - get the right tools for your real estate needs.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card glass shadow-lg h-100 animate__animated animate__fadeInRight">
                                <div className="card-body text-center p-4">
                                    <i className="fas fa-shield-alt fa-3x mb-3 text-primary"></i>
                                    <h5 className="card-title fs-4">Secure Management</h5>
                                    <p className="card-text">Advanced security with Firebase and role-based permissions for peace of mind.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sample properties carousel */}
            <section className="py-5">
                <div className="container">
                    <h2 className="text-center mb-5 fs-1 fw-bold">Featured Properties</h2>
                    <div id="propertyCarousel" className="carousel slide shadow-lg" data-bs-ride="carousel">
                        <div className="carousel-inner">
                            <div className="carousel-item active">
                                <img
                                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2070&q=80"
                                    className="d-block w-100"
                                    alt="Luxury Home"
                                    style={{ height: '400px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                                />
                                <div className="carousel-caption d-none d-md-block">
                                    <h5>Luxury Villa</h5>
                                    <p>Experience premium living in style.</p>
                                </div>
                            </div>
                            <div className="carousel-item">
                                <img
                                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1973&q=80"
                                    className="d-block w-100"
                                    alt="Modern Apartment"
                                    style={{ height: '400px', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
                                />
                                <div className="carousel-caption d-none d-md-block">
                                    <h5>Modern Apartment</h5>
                                    <p>Urban living at its finest.</p>
                                </div>
                            </div>
                        </div>
                        <button className="carousel-control-prev" type="button" data-bs-target="#propertyCarousel" data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target="#propertyCarousel" data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonial */}
            <section className="py-5 bg-gradient" style={{ background: 'var(--primary-gradient)' }}>
                <div className="container text-center">
                    <blockquote className="blockquote text-white fs-4">
                        <p>Find your perfect space, effortlessly. Trusted by thousands for secure, smart, and seamless property deals.</p>
                    </blockquote>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-4 text-center" style={{ background: 'var(--bg-dark)' }}>
                <div className="container">
                    <p>&copy; 2025 CityProperty. All rights reserved.</p>
                    <div className="mt-2">
                        <a href="#" className="text-white-50 mx-2">Privacy Policy</a>
                        <a href="#" className="text-white-50 mx-2">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Login;
