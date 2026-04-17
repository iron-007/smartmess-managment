import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageLoaderService } from '../image-loader.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  logoUrl: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private imageLoader: ImageLoaderService,
    private http: HttpClient
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],   // ✅ FIXED
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.loadLogo();
  }

  loadLogo() {
    this.logoUrl = '/assets/Smartmess.png';
  }

  onSubmit(): void {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const data = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.http.post('http://localhost:3000/login', data)
      .subscribe(
        (res: any) => {
          if (res.success) {
            alert("✅ Login Successful");
            // this.router.navigate(['/dashboard']);
          } else {
            alert("❌ Invalid Credentials");
          }
        },
        (err) => {
          alert("❌ Server Error");
        }
      );
  }
}
