import { Routes } from '@angular/router';
import { LoginComponent } from './common-pages/login/login.component';
import { authGuard } from './common/security/auth.guard';
import { logoutGuard } from './common/security/logout.guard';


export const routes: Routes = [
    {
        path: 'ccd-home',
        canActivate: [authGuard],
        loadComponent: () => import('./ccd/pages/ccd-home/ccd-home.component').then(m => m.CcdHomeComponent),
        children: [
            // {
            //     path: '',
            //     redirectTo: 'ccd-activity',
            //     pathMatch: 'full'
            // },
            {
                path: 'ccd-activity',
                loadComponent: () => import('./ccd/pages/ccd-activity/ccd-activity.component').then(m => m.CcdActivityComponent)
            },
            {
                path: 'ccd-settings',
                loadComponent: () => import('./ccd/pages/ccd-settings/ccd-settings.component').then(m => m.CcdSettingsComponent)
            },
            {
                path: 'ccd-help',
                loadComponent: () => import('./ccd/pages/ccd-help/ccd-help.component').then(m => m.CcdHelpComponent)
            }
        ]
    },
    {
        path: 'cd-home',
        canActivate: [authGuard],
        loadComponent: () => import('./cd/pages/cd-home/cd-home.component').then(m => m.CdHomeComponent),
        children: [
            {
                path: 'cd-client-management',
                loadComponent: () => import('./cd/pages/cd-client-management/cd-client-management.component').then(m => m.CdClientManagementComponent)
            },
            {
                path: 'cd-profile-management',
                loadComponent: () => import('./cd/pages/cd-profile-management/cd-profile-management.component').then(m => m.CdProfileManagementComponent)
            },
            {
                path: 'cd-role-management',
                loadComponent: () => import('./cd/pages/cd-role-management/cd-role-management.component').then(m => m.CdRoleManagementComponent)
            },
            {
                path: 'cd-user-management',
                loadComponent: () => import('./cd/pages/cd-user-management/cd-user-management.component').then(m => m.CdUserManagementComponent)
            },
            {
                path: 'cd-support',
                loadComponent: () => import('./cd/pages/cd-support/cd-support.component').then(m => m.CdSupportComponent)
            },
            {
                path: 'cd-support/view-ticket',
                loadComponent: () => import('./cd/pages/cd-view-ticket/cd-view-ticket.component').then(m => m.CdViewTicketComponent)
            }
        ]
    },
    {
        path: 'cd-logout',
        loadComponent: () => import('./cd/pages/cd-logout/cd-logout.component').then(m => m.CdLogoutComponent),
    },
    {
        path: 'cd-404',
        loadComponent: () => import('./cd/pages/cd-404/cd-404.component').then(m => m.Cd404Component),
    },
    {
        path: 'login',
        loadComponent: () => import('./common-pages/login/login.component').then(m => m.LoginComponent),
    },
    {
        path: 'logout',
        canActivate: [logoutGuard],
        loadComponent: () => import('./common-pages/logout/logout.component').then(m => m.LogoutComponent),
    },
    { path: '**', redirectTo: 'ccd-home' },
    // Common Pages
    

];
