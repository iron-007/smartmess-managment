import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./landingPage.css";

const LandingPage = () => {
    const [formStatus, setFormStatus] = useState(null);
    const [activeFaq, setActiveFaq] = useState(null);

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setFormStatus('submitting');

        const form = e.target;
        const formData = new FormData(form);

        try {
            const response = await fetch("https://formsubmit.co/ajax/aryan.pandey01x@gmail.com", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setFormStatus('success');
                form.reset();
                setTimeout(() => setFormStatus(null), 5000);
            } else {
                setFormStatus('error');
                setTimeout(() => setFormStatus(null), 5000);
            }
        } catch (error) {
            setFormStatus('error');
            setTimeout(() => setFormStatus(null), 5000);
        }
    };

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
                    <div className="nav-links d-none d-md-flex gap-4 align-items-center fw-medium">
                        <a href="#features" className="text-dark text-decoration-none opacity-75 text-hover-primary">Features</a>
                        <a href="#roles" className="text-dark text-decoration-none opacity-75 text-hover-primary">Solutions</a>
                        <a href="#about" className="text-dark text-decoration-none opacity-75 text-hover-primary">About Us</a>
                        <a href="#contact" className="text-dark text-decoration-none opacity-75 text-hover-primary">Contact Us</a>
                        <Link to="/login" className="btn btn-outline-dark rounded-pill px-4 ms-2">Login</Link>
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
                            <h6 className="text-primary fw-bold text-uppercase ls-wide mb-2">Solutions</h6>
                            <h2 className="fw-bold mb-4">Tailored experience for every user</h2>
                            <p className="text-muted mb-5">
                                We've built dedicated workflows to ensure every stakeholder has the tools they need at their fingertips.
                            </p>
                            <div className="role-selector">
                                <div className="role-item p-3 rounded-4 mb-3 d-flex align-items-center gap-3">
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
                            name: "Anand Raj",
                            role: "Backend Developer",
                            intro: "Architecting robust and scalable server-side solutions. Obsessed with data integrity, API performance, and building the unbreakable logic that powers SmartMess from the ground up.",
                            img: "/anand_pic.jpeg",
                            coverBg: "linear-gradient(135deg, #4A00E0 0%, #8E2DE2 100%)",
                            socials: {
                                twitter: "https://x.com/raj_anand89067",
                                github: "https://github.com/iron-007",
                                linkedin: "https://www.linkedin.com/in/anand-raj-50888a291"
                            }
                        },
                        {
                            name: "Aryan Pandey",
                            role: "Frontend / Backend Developer",
                            intro: "The ultimate full-stack problem solver. Blending pixel-perfect UI design with powerful backend algorithms to deliver a truly seamless, end-to-end mess management experience.",
                            img: "/aryan_pic.png",
                            coverBg: "var(--brand-gradient)",
                            socials: {
                                twitter: "https://x.com/aryan02006",
                                github: "https://github.com/Aryan02006",
                                linkedin: "https://www.linkedin.com/in/aryan-pandey084/"
                            }
                        },
                        {
                            name: "Samar Shivam",
                            role: "Frontend Developer",
                            intro: "Breathing life into code with stunning visuals and buttery-smooth interactions. Dedicated to crafting an intuitive, modern, and engaging user interface that users love at first sight.",
                            img: "/samar_pic.png",
                            coverBg: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                            socials: {
                                twitter: "https://x.com/samar78088",
                                github: "https://github.com/samar62023",
                                linkedin: "https://www.linkedin.com/in/samar-shivam62023/"
                            }
                        }
                    ].map((person, i) => (
                        <div key={i} className="col-md-4 slide-up" style={{ animationDelay: `${0.1 * (i + 1)}s` }}>
                            <div className="team-card glass-card h-100 transition-all text-center position-relative overflow-hidden d-flex flex-column" style={{ padding: 0 }}>
                                <div className="team-card-cover w-100" style={{ height: '120px', background: person.coverBg, opacity: 0.9 }}></div>
                                <div className="p-4 pt-0 flex-grow-1 d-flex flex-column position-relative">
                                    <div className="team-img-wrapper mx-auto position-relative shadow-lg" style={{ width: '140px', height: '140px', borderRadius: '50%', padding: '5px', background: 'white', zIndex: 2, marginTop: '-70px', marginBottom: '20px' }}>
                                        <img src={person.img} alt={person.name} className="img-fluid" style={{ borderRadius: '50%', width: '100%', height: '100%', objectFit: 'cover', border: '4px solid white', backgroundColor: 'white' }} />
                                    </div>
                                    <h4 className="fw-bold mb-2">{person.name}</h4>
                                    <div className="mb-3">
                                        <span className="badge rounded-pill px-3 py-2 fw-bold shadow-sm" style={{ background: person.coverBg, color: 'white' }}>{person.role}</span>
                                    </div>
                                    <p className="text-muted small mb-4 flex-grow-1 px-2">{person.intro}</p>
                                    {person.socials && (
                                        <div className="social-links d-flex justify-content-center gap-3 mt-auto">
                                            {person.socials.twitter && (
                                                <a href={person.socials.twitter} target="_blank" rel="noopener noreferrer" className="social-btn"><i className="bi bi-twitter-x"></i></a>
                                            )}
                                            {person.socials.github && (
                                                <a href={person.socials.github} target="_blank" rel="noopener noreferrer" className="social-btn"><i className="bi bi-github"></i></a>
                                            )}
                                            {person.socials.linkedin && (
                                                <a href={person.socials.linkedin} target="_blank" rel="noopener noreferrer" className="social-btn"><i className="bi bi-linkedin"></i></a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ SECTION */}
            <section id="faq" className="faq-section container py-5 my-5">
                <div className="text-center mb-5 fade-in">
                    <h6 className="text-primary fw-bold text-uppercase ls-wide">Questions?</h6>
                    <h2 className="section-title fw-bold">Frequently Asked <span className="text-gradient">Questions</span></h2>
                    <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
                        Everything you need to know about the product and how it works.
                    </p>
                </div>
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="d-flex flex-column gap-3">
                            {[
                                {
                                    q: "How does the dynamic pricing model work?",
                                    a: "Instead of a flat monthly fee, our system calculates costs based on real-time consumption and attendance. If you cancel a meal in advance, you aren't charged for it, saving students money and drastically reducing food waste."
                                },
                                {
                                    q: "Can students cancel meals at the last minute?",
                                    a: "Students can easily manage meal requests through their personalized dashboard. To ensure accurate food preparation quantities, administrators can enforce a customizable notice period (e.g., 2 hours before mealtime)."
                                },
                                {
                                    q: "How secure is the billing and ledger data?",
                                    a: "SmartMess employs strict role-based access control (RBAC). Butlers can only log attendance, while admins oversee operations. All transactions are securely recorded in an immutable ledger, ensuring 100% transparency for everyone."
                                },
                                {
                                    q: "Do I need special hardware to mark attendance?",
                                    a: "No! Our system works flawlessly on any modern smartphone, tablet, or PC. Butlers can instantly verify students using their ID or via a quick search on the dedicated staff interface."
                                }
                            ].map((faq, index) => (
                                <div key={index} className="glass-card rounded-4 overflow-hidden slide-up" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                                    <button 
                                        className="w-100 text-start bg-transparent border-0 p-4 d-flex justify-content-between align-items-center fw-bold text-dark"
                                        onClick={() => toggleFaq(index)}
                                    >
                                        <span className="fs-5">{faq.q}</span>
                                        <div className="icon-circle shadow-sm" style={{ width: '32px', height: '32px', background: activeFaq === index ? 'var(--brand-gradient)' : '#f8f9fa', color: activeFaq === index ? 'white' : 'var(--text-muted)' }}>
                                            <i className={`bi bi-chevron-${activeFaq === index ? 'up' : 'down'}`}></i>
                                        </div>
                                    </button>
                                    <div 
                                        className="px-4" 
                                        style={{ 
                                            maxHeight: activeFaq === index ? '200px' : '0', 
                                            opacity: activeFaq === index ? 1 : 0, 
                                            overflow: 'hidden', 
                                            transition: 'all 0.3s ease-in-out',
                                            paddingBottom: activeFaq === index ? '1.5rem' : '0'
                                        }}
                                    >
                                        <p className="text-muted mb-0">{faq.a}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
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

            {/* CONTACT US SECTION */}
            <section id="contact" className="contact-section container py-5 my-5">
                <div className="text-center mb-5 fade-in">
                    <h6 className="text-primary fw-bold text-uppercase ls-wide">Get in Touch</h6>
                    <h2 className="section-title fw-bold">Contact <span className="text-gradient">Us</span></h2>
                    <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
                        Have questions about SmartMess? Want to integrate it into your institution? Drop us a message and our team will get back to you shortly.
                    </p>
                </div>

                <div className="row g-5 align-items-center justify-content-center">
                    <div className="col-lg-5 slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="glass-panel p-5 rounded-5 position-relative overflow-hidden h-100 d-flex flex-column justify-content-center">
                            <div className="cta-bg-glow" style={{ opacity: 0.1, filter: 'blur(100px)' }}></div>
                            <h3 className="fw-bold mb-4">Contact Information</h3>
                            <p className="text-muted mb-5">Fill out the form and we will be in touch within 24 hours.</p>

                            <div className="d-flex align-items-center mb-4">
                                <div className="icon-circle bg-primary-soft text-primary me-3">
                                    <i className="bi bi-geo-alt-fill fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0">Our Office</h6>
                                    <span className="text-muted small">GNDEC, Ludhiana</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center mb-4">
                                <div className="icon-circle bg-success-soft text-success me-3">
                                    <i className="bi bi-envelope-fill fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0">Email Us</h6>
                                    <span className="text-muted small">aryan.pande01x@gmail.com</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center mb-5">
                                <div className="icon-circle text-info me-3" style={{ background: '#e0f7fa' }}>
                                    <i className="bi bi-telephone-fill fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-0">Call Us</h6>
                                    <span className="text-muted small">+91 70090 79926</span>
                                </div>
                            </div>

                            <div className="social-links d-flex gap-3 mt-auto">
                                <a href="https://x.com/raj_anand89067" target="_blank" rel="noopener noreferrer" className="social-btn"><i className="bi bi-twitter-x"></i></a>
                                <a href="https://github.com/Aryan02006" target="_blank" rel="noopener noreferrer" className="social-btn"><i className="bi bi-github"></i></a>
                                <a href="https://www.linkedin.com/in/anand-raj-50888a291" target="_blank" rel="noopener noreferrer" className="social-btn"><i className="bi bi-linkedin"></i></a>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5 slide-up" style={{ animationDelay: '0.4s' }}>
                        <div className="glass-card p-5 rounded-5 h-100 d-flex flex-column justify-content-center w-100">
                            <h3 className="fw-bold mb-4">Send us a Message</h3>

                            {formStatus === 'success' && (
                                <div className="alert alert-success d-flex align-items-center py-2 mb-4 slide-up" role="alert">
                                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                                    <div>Message sent successfully! We'll be in touch.</div>
                                </div>
                            )}

                            {formStatus === 'error' && (
                                <div className="alert alert-danger d-flex align-items-center py-2 mb-4 slide-up" role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                                    <div>Oops! Something went wrong. Please try again.</div>
                                </div>
                            )}

                            <form onSubmit={handleContactSubmit}>
                                <input type="hidden" name="_subject" value="New Submission from SmartMess Contact Us!" />
                                <input type="hidden" name="_captcha" value="false" />

                                <div className="row g-2">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted mb-1">First Name</label>
                                        <input type="text" name="firstName" className="form-control bg-light border-0 shadow-sm px-3 py-2" required placeholder="John" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted mb-1">Last Name</label>
                                        <input type="text" name="lastName" className="form-control bg-light border-0 shadow-sm px-3 py-2" required placeholder="Doe" />
                                    </div>
                                    <div className="col-12 mt-3">
                                        <label className="form-label fw-bold small text-muted mb-1">Email Address</label>
                                        <input type="email" name="email" className="form-control bg-light border-0 shadow-sm px-3 py-2" required placeholder="john@example.com" />
                                    </div>
                                    <div className="col-12 mt-3">
                                        <label className="form-label fw-bold small text-muted mb-1">Your Query</label>
                                        <textarea name="message" className="form-control bg-light border-0 shadow-sm px-3 py-2" rows="3" required placeholder="How can we help you?"></textarea>
                                    </div>
                                    <div className="col-12 mt-4">
                                        <button type="submit" className="btn btn-gradient w-100 rounded-pill fw-bold shadow py-2" disabled={formStatus === 'submitting'}>
                                            {formStatus === 'submitting' ? (
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            ) : (
                                                <>Send Message <i className="bi bi-send ms-2"></i></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer-section py-5 mt-5 position-relative overflow-hidden" style={{ backgroundColor: 'var(--bg-soft)' }}>
                <div className="cta-bg-glow" style={{ opacity: 0.1, left: '-5%', top: '80%' }}></div>
                <div className="cta-bg-glow" style={{ opacity: 0.1, left: '105%', top: '20%', background: 'var(--brand-secondary)' }}></div>
                <div className="container position-relative z-1">
                    <div className="row g-4 justify-content-between">
                        <div className="col-lg-4 slide-up">
                            <div className="logo d-flex align-items-center mb-4">
                                <div className="logo-icon me-2 shadow-sm">
                                    <i className="bi bi-hexagon-fill"></i>
                                </div>
                                <span className="logo-text">SmartMess</span>
                            </div>
                            <p className="text-muted small pe-lg-4 lh-lg">
                                The ultimate mess management solution designed for the modern educational ecosystem. Built with ❤️ for transparency and efficiency.
                            </p>
                            <div className="social-links d-flex gap-3 mt-4">
                                <a href="https://x.com/aryan02006" target="_blank" rel="noopener noreferrer" className="social-btn"><i className="bi bi-twitter-x"></i></a>
                                <a href="https://github.com/Aryan02006" target="_blank" rel="noopener noreferrer" className="social-btn"><i className="bi bi-github"></i></a>
                                <a href="https://www.linkedin.com/in/aryan-pandey084/" target="_blank" rel="noopener noreferrer" className="social-btn"><i className="bi bi-linkedin"></i></a>
                            </div>
                        </div>
                        <div className="col-lg-2 col-6 slide-up" style={{ animationDelay: '0.1s' }}>
                            <h6 className="fw-bold mb-4 text-dark">Product</h6>
                            <ul className="list-unstyled text-muted small d-flex flex-column gap-2">
                                <li><a href="#features" className="text-muted text-decoration-none text-hover-primary d-inline-flex align-items-center"><i className="bi bi-arrow-right-short me-1 fs-5"></i>Features</a></li>
                                <li><a href="#roles" className="text-muted text-decoration-none text-hover-primary d-inline-flex align-items-center"><i className="bi bi-arrow-right-short me-1 fs-5"></i>Solutions</a></li>
                                <li><a href="#faq" className="text-muted text-decoration-none text-hover-primary d-inline-flex align-items-center"><i className="bi bi-arrow-right-short me-1 fs-5"></i>FAQ</a></li>
                                <li><Link to="/login" className="text-muted text-decoration-none text-hover-primary d-inline-flex align-items-center"><i className="bi bi-arrow-right-short me-1 fs-5"></i>Updates <span className="badge bg-primary-soft text-primary ms-2 rounded-pill">New</span></Link></li>
                            </ul>
                        </div>
                        <div className="col-lg-2 col-6 slide-up" style={{ animationDelay: '0.2s' }}>
                            <h6 className="fw-bold mb-4 text-dark">Company</h6>
                            <ul className="list-unstyled text-muted small d-flex flex-column gap-2">
                                <li><a href="#about" className="text-muted text-decoration-none text-hover-primary d-inline-flex align-items-center"><i className="bi bi-arrow-right-short me-1 fs-5"></i>About Us</a></li>
                                <li><a href="#contact" className="text-muted text-decoration-none text-hover-primary d-inline-flex align-items-center"><i className="bi bi-arrow-right-short me-1 fs-5"></i>Contact</a></li>
                            </ul>
                        </div>
                        <div className="col-lg-3 slide-up" style={{ animationDelay: '0.3s' }}>
                            <h6 className="fw-bold mb-4 text-dark">Subscribe to our newsletter</h6>
                            <div className="input-group mb-3 glass-card rounded-pill overflow-hidden p-1 shadow-sm border-0 bg-white">
                                <input type="text" className="form-control border-0 bg-transparent px-3 shadow-none" placeholder="email@example.com" />
                                <button className="btn btn-gradient rounded-pill px-4 shadow-sm" type="button"><i className="bi bi-send-fill"></i></button>
                            </div>
                            <p className="smaller text-muted">Get the latest updates and feature releases delivered straight to your inbox.</p>
                        </div>
                    </div>
                    <div className="text-center mt-5 pt-4 border-top">
                        <p className="text-muted smaller mb-0 fw-medium">© 2026 SmartMess Management System. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;