import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuienSoyComponent } from './quien-soy.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('QuienSoyComponent', () => {
  let component: QuienSoyComponent;
  let fixture: ComponentFixture<QuienSoyComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuienSoyComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(QuienSoyComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`https://api.github.com/users/${component.githubUsername}`);
    req.flush({});
    expect(component).toBeTruthy();
  });

  it('should start in loading state', () => {
    fixture.detectChanges();
    expect(component.loading).toBeTrue();
    const req = httpMock.expectOne(`https://api.github.com/users/${component.githubUsername}`);
    req.flush({});
  });

  it('should populate githubUser on successful API response', () => {
    const mockUser = {
      name: 'Damián Dattilo',
      login: 'damiandattilo1',
      avatar_url: 'https://example.com/avatar.jpg',
      bio: 'Estudiante UTN',
      public_repos: 10,
      followers: 5,
      following: 3,
      html_url: 'https://github.com/damiandattilo1',
      location: 'Buenos Aires',
      blog: ''
    };
    fixture.detectChanges();
    const req = httpMock.expectOne(`https://api.github.com/users/${component.githubUsername}`);
    req.flush(mockUser);
    expect(component.githubUser).toEqual(mockUser);
    expect(component.loading).toBeFalse();
  });

  it('should set error message on API failure', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`https://api.github.com/users/${component.githubUsername}`);
    req.flush('Error', { status: 404, statusText: 'Not Found' });
    expect(component.error).toBeTruthy();
    expect(component.loading).toBeFalse();
  });

  it('should use the correct GitHub username', () => {
    fixture.detectChanges();
    expect(component.githubUsername).toBe('damiandattilo1');
    const req = httpMock.expectOne(`https://api.github.com/users/damiandattilo1`);
    req.flush({});
  });
});
