import React from 'react';
import { Router, Route, Switch } from 'wouter';

// Import pages
import { HomePage } from './pages/Home';
import { CoursesPage } from './pages/Courses';
import { LearnPage } from './pages/Learn';
import { LeaderboardPage } from './pages/Leaderboard';
import { ShopPage } from './pages/Shop';
import { QuestsPage } from './pages/Quests';
import { LessonPage } from './pages/Lesson';
import { AdminPage } from './pages/Admin';

export function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/courses" component={CoursesPage} />
        <Route path="/learn" component={LearnPage} />
        <Route path="/leaderboard" component={LeaderboardPage} />
        <Route path="/shop" component={ShopPage} />
        <Route path="/quests" component={QuestsPage} />
        <Route path="/lesson/:lessonId" component={LessonPage} />
        <Route path="/admin" component={AdminPage} />
        <Route>404 - Not Found</Route>
      </Switch>
    </Router>
  );
}
