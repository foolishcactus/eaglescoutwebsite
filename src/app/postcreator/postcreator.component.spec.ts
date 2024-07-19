import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostcreatorComponent } from './postcreator.component';

describe('PostcreatorComponent', () => {
  let component: PostcreatorComponent;
  let fixture: ComponentFixture<PostcreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostcreatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostcreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
