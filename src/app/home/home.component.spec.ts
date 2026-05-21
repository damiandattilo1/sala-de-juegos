import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { HomeComponent } from './home.component';
import { AuthService } from '../auth.service';
import { provideRouter } from '@angular/router';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const authState$ = new BehaviorSubject<any>(null);
  const authMock = {
    currentUser$: authState$,
    getNombreUsuario: jasmine.createSpy('getNombreUsuario').and.resolveTo('')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the welcome heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Sala de Juegos');
  });

  it('should render at least one game card', () => {
    authState$.next({ uid: '123', email: 'test@test.com' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.game-card');
    expect(cards.length).toBeGreaterThan(0);
  });
});
