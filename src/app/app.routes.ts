import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ResourcesComponent } from './resources/resources.component';
import { GuideComponent } from './guide/guide.component';
import { ProjectfinderComponent } from './projectfinder/projectfinder.component';
import { ApplyComponent } from './apply/apply.component';
import { LoginComponent } from './login/login.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'resources', component: ResourcesComponent },
  { path: 'guide', component: GuideComponent },
  { path: 'projectfinder', component: ProjectfinderComponent },
  { path: 'apply', component: ApplyComponent },
  { path: 'login', component: LoginComponent },
  { path: 'user-dashboard', component: UserDashboardComponent },
  { path: 'passwordreset', component: PasswordresetComponent },
];
