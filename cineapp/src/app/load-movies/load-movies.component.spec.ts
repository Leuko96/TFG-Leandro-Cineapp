import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadMoviesComponent } from './load-movies.component';

describe('LoadMoviesComponent', () => {
  let component: LoadMoviesComponent;
  let fixture: ComponentFixture<LoadMoviesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadMoviesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoadMoviesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
