import { Client } from './../../cd-services/cd-client-list-service/cd-client-list-service.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { CdCreateClientDialogComponent } from '../../cd-components/cd-create-client-dialog/cd-create-client-dialog.component';
import { CdClientListComponentComponent } from '../../cd-components/cd-client-list-component/cd-client-list-component.component';
import { CdTitleServiceService } from '../../cd-services/cd-title-service/cd-title-service.service';
import { CdModeDirectiveDirective } from '../../cd-directives/cd-mode-directive/cd-mode-directive.directive';

@Component({
  selector: 'app-cd-client-management',
  imports: [
    MatButtonModule,
    MatExpansionModule,
    MatTabsModule,
    CdClientListComponentComponent,
    CdModeDirectiveDirective,
  ],
  templateUrl: './cd-client-management.component.html',
  styleUrl: './cd-client-management.component.scss',
})
export class CdClientManagementComponent implements OnInit {
  homeTitle: string = 'Home';
  @ViewChild(CdClientListComponentComponent)
  clientListComponent!: CdClientListComponentComponent;

  constructor(
    private dialog: MatDialog,
    private titleService: CdTitleServiceService
  ) {}

  ngOnInit(): void {
    this.titleService.currentHomeTitle.subscribe((title) => {
      this.homeTitle = title;
    });
  }

  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(CdCreateClientDialogComponent, {
      width: '600px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log('Dialog result:', result);
        this.clientListComponent.addClient(result);
      }
    });
  }
}
