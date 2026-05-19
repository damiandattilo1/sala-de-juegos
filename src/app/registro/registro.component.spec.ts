import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroComponent } from './registro.component';
import { provideRouter } from '@angular/router';
import { routes } from '../app.routes';

describe('RegistroComponent', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroComponent],
      providers: [provideRouter(routes)]
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

  it('should show error when submitting empty form', () => {
    component.onSubmit();
    expect(component.error).toBeTruthy();
  });

  it('should show error when passwords do not match', () => {
    component.nombre = 'Damián';
    component.email = 'test@test.com';
    component.password = 'abc123';
    component.confirmPassword = 'xyz999';
    component.onSubmit();
    expect(component.error).toContain('coinciden');
  });

  it('should set success message on valid submit', () => {
    component.nombre = 'Damián';
    component.email = 'test@test.com';
    component.password = 'abc123';
    component.confirmPassword = 'abc123';
    component.onSubmit();
    expect(component.success).toBeTruthy();
    expect(component.error).toBe('');
  });

  it('should render four input fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const inputs = compiled.querySelectorAll('input');
    expect(inputs.length).toBe(4);
  });
});
