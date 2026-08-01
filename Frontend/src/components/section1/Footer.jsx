const Footer = () => {
  return (
    <footer className="footer">

        <div className="footer-grid">

            <div className="footer-column">

                <h3>Participate</h3>

                <a href="#">Competitions & Challenges</a>
                <a href="#">Assessments</a>
                <a href="#">Hackathons</a>
                <a href="#">Workshops & Webinars</a>
                <a href="#">Conferences</a>
                <a href="#">Cultural Events</a>
                <a href="#">College Festivals</a>

            </div>


            <div className="footer-column">

                <h3>Apply</h3>

                <a href="#">Internships</a>
                <a href="#">Jobs</a>
                <a href="#">Scholarships</a>
                <a href="#">Summer Internships</a>
                <a href="#">PPO Internships</a>
                <a href="#">Government Jobs</a>
                <a href="#">International Internships</a>

            </div>


            <div className="footer-column">

                <h3>For Business</h3>

                <a href="#">Our Clients</a>
                <a href="#">Partner With Us</a>
                <a href="#">Success Stories</a>
                <a href="#">Case Studies</a>
                <a href="#">Post Opportunities</a>

            </div>


            <div className="footer-column">

                <h3>Learn</h3>

                <a href="#">Courses</a>
                <a href="#">Articles</a>
                <a href="#">Blog</a>
                <a href="#">Workshops</a>
                <a href="#">Resources</a>

                <h3 className="footer-heading">Practice</h3>

                <a href="#">Interview Preparation</a>
                <a href="#">Coding Challenges</a>
                <a href="#">Assessments</a>
                <a href="#">100 Days of Coding</a>

            </div>


            <div className="footer-column">

                <h3>Oppora</h3>

                <a href="#">About Us</a>
                <a href="#">Careers</a>
                <a href="#">Life at Oppora</a>
                <a href="#">FAQs</a>
                <a href="#">Brand Guidelines</a>
                <a href="#">Rewards Program</a>
                <a href="#">Refer & Earn</a>
                <a href="#">Campus Ambassador Program</a>
                <a href="#">Request a Feature</a>
                <a href="#">Build Your Resume</a>

            </div>

        </div>


        <div className="footer-bottom">

            <h1>
    <span className="logo7">O</span>PPORA
</h1>

            <div>
                © {new Date().getFullYear()} Oppora. All Rights Reserved.
            </div>

        </div>


    </footer>
  );
};

export default Footer;