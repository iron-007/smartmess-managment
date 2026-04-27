import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
    return (
        <div className="landing-container">
            {/* NAVBAR */}
            <nav className="landing-nav fade-in">
                <div className="container d-flex justify-content-between align-items-center py-4">
                    <div className="logo d-flex align-items-center">
                        <div className="logo-icon me-2">
                            <i className="bi bi-hexagon-fill"></i>
                        </div>
                        <span className="logo-text">SmartMess</span>
                    </div>
                    <div className="nav-links d-none d-md-flex gap-4 align-items-center">
                        <a href="#features">Features</a>
                        <a href="#roles">Roles</a>
                        <a href="#about">About Us</a>
                        <Link to="/login" className="btn btn-outline-dark rounded-pill px-4">Login</Link>
                        <Link to="/register" className="btn btn-gradient rounded-pill px-4">Get Started</Link>
                    </div>
                    <div className="d-md-none">
                        <Link to="/login" className="btn btn-sm btn-gradient rounded-pill px-3">Login</Link>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <header className="hero-section container py-5">
                <div className="row align-items-center g-5">
                    <div className="col-lg-6 slide-up">
                        <h1 className="hero-title mb-4">
                            The Future of <span className="text-gradient">Mess Management</span> is Here.
                        </h1>
                        <p className="hero-subtitle mb-5 text-muted">
                            Streamline your mess operations with real-time tracking, dynamic pricing, and automated billing.
                            A comprehensive solution for students, staff, and administrators.
                        </p>
                        <div className="d-flex gap-3">
                            <Link to="/register" className="btn btn-gradient btn-lg rounded-pill px-5 py-3 fw-bold shadow">
                                Join Now <i className="bi bi-arrow-right ms-2"></i>
                            </Link>
                            <Link to="/login" className="btn btn-outline-dark btn-lg rounded-pill px-5 py-3 fw-bold">
                                Admin Login
                            </Link>
                        </div>
                    </div>
                    <div className="col-lg-6 fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="hero-image-container">
                            <div className="glass-card main-img shadow-lg overflow-hidden">
                                <img
                                    src="/smart_mess_hero.png"
                                    alt="Smart Mess Dashboard"
                                    className="img-fluid"
                                    onError={(e) => {
                                        // Fallback if image path is not absolute or correct in public/
                                        e.target.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";
                                    }}
                                />
                            </div>
                            <div className="floating-card stat-card-1 glass-card shadow p-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="icon-circle bg-success-soft text-success"><i className="bi bi-check-lg"></i></div>
                                    <div>
                                        <div className="fw-bold small">Attendance Recorded</div>
                                        <div className="text-muted smaller">Just now</div>
                                    </div>
                                </div>
                            </div>
                            <div className="floating-card stat-card-2 glass-card shadow p-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="icon-circle bg-primary-soft text-primary"><i className="bi bi-currency-rupee"></i></div>
                                    <div>
                                        <div className="fw-bold small">Dynamic Billing</div>
                                        <div className="text-muted smaller">Live Updates</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* STATS SECTION */}
            <section className="stats-section py-5 bg-light">
                <div className="container">
                    <div className="row g-4 text-center">
                        <div className="col-md-3 col-6">
                            <div className="stat-item">
                                <h2 className="fw-bold mb-0">500+</h2>
                                <p className="text-muted">Active Students</p>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className="stat-item">
                                <h2 className="fw-bold mb-0">15k+</h2>
                                <p className="text-muted">Meals Served</p>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className="stat-item">
                                <h2 className="fw-bold mb-0">100%</h2>
                                <p className="text-muted">Billing Accuracy</p>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className="stat-item">
                                <h2 className="fw-bold mb-0">24/7</h2>
                                <p className="text-muted">System Uptime</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="features-section container py-5 my-5">
                <div className="text-center mb-5 fade-in">
                    <h6 className="text-primary fw-bold text-uppercase ls-wide">Core Features</h6>
                    <h2 className="section-title fw-bold">Everything you need to run a modern mess</h2>
                </div>
                <div className="row g-4">
                    {[
                        {
                            icon: "bi bi-graph-up-arrow",
                            title: "Dynamic Pricing",
                            desc: "Prices adjust automatically based on consumption and rules. No more fixed fee headaches.",
                            color: "orange"
                        },
                        {
                            icon: "bi bi-qr-code-scan",
                            title: "Live Attendance",
                            desc: "Butlers can mark attendance in real-time. Students see their consumption instantly.",
                            color: "pink"
                        },
                        {
                            icon: "bi bi-calendar-check",
                            title: "Meal Requests",
                            desc: "Students can cancel meals with a few taps. Smart rules handle notice periods.",
                            color: "blue"
                        },
                        {
                            icon: "bi bi-receipt",
                            title: "Transparent Ledger",
                            desc: "Complete breakdown of every meal, extra, and guest charge. Detailed billing history.",
                            color: "purple"
                        },
                        {
                            icon: "bi bi-megaphone",
                            title: "Smart Notices",
                            desc: "Keep everyone informed with a digital notice board for menus and announcements.",
                            color: "green"
                        },
                        {
                            icon: "bi bi-shield-lock",
                            title: "Secure Access",
                            desc: "Role-based access control for Admins, Butlers, and Students ensures data integrity.",
                            color: "indigo"
                        }
                    ].map((feat, i) => (
                        <div key={i} className="col-md-4 slide-up" style={{ animationDelay: `${0.1 * (i + 1)}s` }}>
                            <div className="feature-card glass-card p-4 h-100 transition-all">
                                <div className={`feature-icon icon-bg-${feat.color} mb-4`}>
                                    <i className={feat.icon}></i>
                                </div>
                                <h4 className="fw-bold mb-3">{feat.title}</h4>
                                <p className="text-muted mb-0 small">{feat.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ROLES SECTION */}
            <section id="roles" className="roles-section py-5 my-5 bg-dark text-white">
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-5">
                            <h2 className="fw-bold mb-4">Tailored experience for every user</h2>
                            <p className="text-muted mb-5">
                                We've built dedicated workflows to ensure every stakeholder has the tools they need at their fingertips.
                            </p>
                            <div className="role-selector">
                                <div className="role-item active p-3 rounded-4 mb-3 d-flex align-items-center gap-3">
                                    <div className="icon-circle bg-primary"><i className="bi bi-person-badge"></i></div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">For Administrators</h6>
                                        <small className="opacity-75">Full control over pricing, menu, and users.</small>
                                    </div>
                                </div>
                                <div className="role-item p-3 rounded-4 mb-3 d-flex align-items-center gap-3">
                                    <div className="icon-circle bg-secondary"><i className="bi bi-mortarboard"></i></div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">For Students</h6>
                                        <small className="opacity-75">Manage meals, track dues, and view menus.</small>
                                    </div>
                                </div>
                                <div className="role-item p-3 rounded-4 mb-3 d-flex align-items-center gap-3">
                                    <div className="icon-circle bg-info"><i className="bi bi-person-workspace"></i></div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">For Butler/Staff</h6>
                                        <small className="opacity-75">Live attendance and consumption entry.</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="role-preview-container glass-card p-2 bg-white-10">
                                <img
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                                    alt="Role Preview"
                                    className="img-fluid rounded-4"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT US SECTION */}
            <section id="about" className="about-section container py-5 my-5">
                <div className="text-center mb-5 fade-in">
                    <h6 className="text-primary fw-bold text-uppercase ls-wide">Our Team</h6>
                    <h2 className="section-title fw-bold">Meet the Minds Behind SmartMess</h2>
                </div>
                <div className="row g-4 justify-content-center">
                    {[
                        {
                            name: "Person 1",
                            role: "Lead Developer",
                            intro: "Passionate about building scalable backend systems and optimizing performance for better user experience.",
                            img: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                        },
                        {
                            name: "Person 2",
                            role: "UI/UX Designer",
                            intro: "Dedicated to crafting intuitive interfaces and seamless interactions to make mess management effortless.",
                            img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                        },
                        {
                            name: "Person 3",
                            role: "Product Manager",
                            intro: "Ensuring the product meets the highest standards and solves real-world operational challenges efficiently.",
                            img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                        }
                    ].map((person, i) => (
                        <div key={i} className="col-md-4 slide-up" style={{ animationDelay: `${0.1 * (i + 1)}s` }}>
                            <div className="team-card glass-card p-4 h-100 transition-all text-center">
                                <div className="team-img-wrapper mb-4 mx-auto position-relative shadow-sm" style={{ width: '160px', height: '160px', borderRadius: '50%', padding: '5px', background: 'var(--brand-gradient)', zIndex: 1 }}>
                                    <img src={person.img} alt={person.name} className="img-fluid" style={{ borderRadius: '50%', width: '100%', height: '100%', objectFit: 'cover', border: '5px solid white' }} />
                                </div>
                                <h4 className="fw-bold mb-1">{person.name}</h4>
                                <h6 className="text-gradient mb-3 fw-bold">{person.role}</h6>
                                <p className="text-muted mb-0 small">{person.intro}</p>
                                <div className="social-links d-flex justify-content-center gap-3 mt-4">
                                    <a href="#" className="text-muted btn btn-light rounded-circle shadow-sm" style={{width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><i className="bi bi-twitter-x"></i></a>
                                    <a href="#" className="text-muted btn btn-light rounded-circle shadow-sm" style={{width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><i className="bi bi-github"></i></a>
                                    <a href="#" className="text-muted btn btn-light rounded-circle shadow-sm" style={{width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><i className="bi bi-linkedin"></i></a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="cta-section container py-5 my-5 text-center slide-up">
                <div className="glass-panel p-5 rounded-5 overflow-hidden position-relative">
                    <div className="cta-bg-glow"></div>
                    <h2 className="fw-bold mb-3 display-5">Ready to revolutionize your mess?</h2>
                    <p className="text-muted mb-5 mx-auto" style={{ maxWidth: '600px' }}>
                        Join hundreds of institutions using SmartMess to eliminate waste and improve student satisfaction.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <Link to="/register" className="btn btn-gradient btn-lg rounded-pill px-5 fw-bold">Register Now</Link>
                        <Link to="/login" className="btn btn-outline-dark btn-lg rounded-pill px-5 fw-bold">Watch Demo</Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer-section py-5 mt-5 border-top">
                <div className="container">
                    <div className="row g-4 justify-content-between">
                        <div className="col-lg-4">
                            <div className="logo d-flex align-items-center mb-4">
                                <div className="logo-icon me-2">
                                    <i className="bi bi-hexagon-fill"></i>
                                </div>
                                <span className="logo-text">SmartMess</span>
                            </div>
                            <p className="text-muted small">
                                The ultimate mess management solution designed for the modern educational ecosystem. Built with ❤️ for transparency and efficiency.
                            </p>
                            <div className="social-links d-flex gap-3 mt-4">
                                <a href="#" className="text-muted fs-5"><i className="bi bi-twitter-x"></i></a>
                                <a href="#" className="text-muted fs-5"><i className="bi bi-github"></i></a>
                                <a href="#" className="text-muted fs-5"><i className="bi bi-linkedin"></i></a>
                            </div>
                        </div>
                        <div className="col-lg-2 col-6">
                            <h6 className="fw-bold mb-4">Product</h6>
                            <ul className="list-unstyled text-muted small d-flex flex-column gap-2">
                                <li><a href="#features">Features</a></li>
                                <li><a href="#roles">Workflows</a></li>
                                <li><a>Pricing</a></li>
                                <li><a>Updates</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-2 col-6">
                            <h6 className="fw-bold mb-4">Company</h6>
                            <ul className="list-unstyled text-muted small d-flex flex-column gap-2">
                                <li><a>About Us</a></li>
                                <li><a>Contact</a></li>
                                <li><a>Privacy Policy</a></li>
                                <li><a>Terms of Service</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-3">
                            <h6 className="fw-bold mb-4">Subscribe to our newsletter</h6>
                            <div className="input-group mb-3 rounded-pill overflow-hidden border">
                                <input type="text" className="form-control border-0 px-3" placeholder="email@example.com" />
                                <button className="btn btn-dark px-3" type="button"><i className="bi bi-send"></i></button>
                            </div>
                            <p className="smaller text-muted">Get the latest updates and feature releases.</p>
                        </div>
                    </div>
                    <div className="text-center mt-5 pt-4 border-top">
                        <p className="text-muted smaller mb-0">© 2026 SmartMess Management System. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;