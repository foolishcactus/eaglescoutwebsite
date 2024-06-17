import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectfinderComponent } from './projectfinder.component';

describe('ProjectfinderComponent', () => {
  let component: ProjectfinderComponent;
  let fixture: ComponentFixture<ProjectfinderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectfinderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectfinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
