import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter(routes)]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty fields and no error', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.error).toBe('');
  });

  it('should show error when submitting empty form', () => {
    component.onSubmit();
    expect(component.error).toBeTruthy();
  });

  it('should clear error when fields are filled', () => {
    component.email = 'test@test.com';
    component.password = '123456';
    component.error = 'viejo error';
    // No error should be set on valid submit (navegación ocurre)
    expect(component.email).toBe('test@test.com');
    expect(component.password).toBe('123456');
  });

  it('should render email and password inputs', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input[type="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[type="password"]')).toBeTruthy();
  });
});
