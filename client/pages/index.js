import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
  return currentUser ? (
    <h1>You are signed in.</h1>
  ) : (
    <h1>You are not signed in.</h1>
  );
};

// Need LandingPage.getInitialProps later for rendering tickets information to landing page
LandingPage.getInitialProps = async (context, client, currentUser) => {
  return {};
};

export default LandingPage;
