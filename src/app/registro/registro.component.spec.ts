import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroComponent } from './registro.component';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';
import { AuthService } from '../auth.service';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;
  const authServiceMock = {
    register: jasmine.createSpy('register').and.resolveTo(undefined)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroComponent],
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty fields', () => {
    expect(component.nombre).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.confirmPassword).toBe('');
  });

  it('should show error when submitting empty form', async () => {
    await component.onSubmit();
    expect(component.error).toBeTruthy();
  });

  it('should show error when passwords do not match', async () => {
    component.nombre = 'Damián';
    component.apellido = 'Dattilo';
    component.edad = 30;
    component.email = 'test@test.com';
    component.password = 'abc123';
    component.confirmPassword = 'xyz999';
    await component.onSubmit();
    expect(component.error).toContain('coinciden');
  });

  it('should set success message on valid submit', async () => {
    component.nombre = 'Damián';
    component.apellido = 'Dattilo';
    component.edad = 30;
    component.email = 'test@test.com';
    component.password = 'abc123';
    component.confirmPassword = 'abc123';
    await component.onSubmit();

    expect(component.success).toBeTruthy();
    expect(component.error).toBe('');
    expect(authServiceMock.register).toHaveBeenCalled();
  });

  it('should render six input fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const inputs = compiled.querySelectorAll('input');
    expect(inputs.length).toBe(6);
  });
});
