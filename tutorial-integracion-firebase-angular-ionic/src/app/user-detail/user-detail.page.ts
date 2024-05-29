import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Storage, getDownloadURL, ref, uploadBytesResumable } from '@angular/fire/storage';
import { FirestoreService } from '../common/services/firestore.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
})
export class UserDetailPage implements OnInit {
  userId: string;
  activeSection: string | null = 'usuario';

  usuarioForm: FormGroup;
  afipForm: FormGroup;
  certificacionIngresosForm: FormGroup;
  planesPagoForm: FormGroup;
  informacionPersonalForm: FormGroup;
  facturacionForm: FormGroup;
  declaracionJuradaForm: FormGroup;
  uploadProgress$: Observable<number>;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private storage: Storage
  ) {}

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');

    this.usuarioForm = this.fb.group({
      dni: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.afipForm = this.fb.group({
      cuit: ['', Validators.required],
      claveFiscal: ['', Validators.required],
    });

    this.certificacionIngresosForm = this.fb.group({
      anio: ['', Validators.required],
      pdf: ['', Validators.required],
    });

    this.planesPagoForm = this.fb.group({
      pdf: ['', Validators.required],
    });

    this.informacionPersonalForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      direccion: ['', Validators.required],
      otrosDetalles: [''],
      pdf: ['', Validators.required],
    });

    this.facturacionForm = this.fb.group({
      cliente: ['', Validators.required],
      facturas: ['', Validators.required],
      pdf: ['', Validators.required],
    });

    this.declaracionJuradaForm = this.fb.group({
      pdf: ['', Validators.required],
    });

    this.loadUserData();
  }

  loadUserData() {
    this.firestoreService.getDocumentChanges<any>(`Usuarios/${this.userId}`).subscribe((userData: any) => {
      if (userData) {
        this.usuarioForm.patchValue({
          dni: userData.dni,
          password: userData.password,
        });

        this.afipForm.patchValue({
          cuit: userData.afip?.cuit,
          claveFiscal: userData.afip?.claveFiscal,
        });

        this.certificacionIngresosForm.patchValue({
          anio: userData.certificacionIngresos?.anio,
          pdf: userData.certificacionIngresos?.pdf,
        });

        this.planesPagoForm.patchValue({
          pdf: userData.planesPago?.pdf,
        });

        this.informacionPersonalForm.patchValue({
          nombre: userData.informacionPersonal?.nombre,
          apellido: userData.informacionPersonal?.apellido,
          direccion: userData.informacionPersonal?.direccion,
          otrosDetalles: userData.informacionPersonal?.otrosDetalles,
          pdf: userData.informacionPersonal?.pdf,
        });

        this.facturacionForm.patchValue({
          cliente: userData.facturacion?.cliente,
          facturas: userData.facturacion?.facturas,
          pdf: userData.facturacion?.pdf,
        });

        this.declaracionJuradaForm.patchValue({
          pdf: userData.declaracionJurada?.pdf,
        });
      }
    });
  }
  async uploadFile(event: any, form: FormGroup, controlName: string) {
    const selectedFile: File = event.target.files[0];
    const filePath = `archivos/${selectedFile.name}`;
    const fileRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, selectedFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.uploadProgress$ = new Observable(observer => {
          observer.next(progress);
          observer.complete();
        });
        console.log('Progreso de la carga:', progress);
      },
      (error) => {
        console.error('Error al cargar el archivo:', error);
      },
      async () => {
        const url = await getDownloadURL(fileRef);
        console.log('URL del archivo:', url);
        form.patchValue({
          [controlName]: url
        });
      }
    );
  }

  saveUsuario() {
    this.firestoreService.updateDocument(this.usuarioForm.value, 'Usuarios', this.userId).then(() => {
      console.log('Usuario guardado', this.usuarioForm.value);
    });
  }

  async saveAfip() {
    await this.saveSubcollectionData(this.afipForm, 'AFIP');
  }

  async saveCertificacionIngresos() {
    await this.saveSubcollectionData(this.certificacionIngresosForm, 'certIngreso');
  }

  async savePlanesPago() {
    await this.saveSubcollectionData(this.planesPagoForm, 'planPago');
  }

  async saveInformacionPersonal() {
    await this.saveSubcollectionData(this.informacionPersonalForm, 'infoPersonal');
  }

  async saveFacturacion() {
    await this.saveSubcollectionData(this.facturacionForm, 'facturacion');
  }

  async saveDeclaracionJurada() {
    await this.saveSubcollectionData(this.declaracionJuradaForm, 'declaracionJurada');
  }

  private async saveSubcollectionData(form: FormGroup, subcollection: string) {
    const userIdPath = `Usuarios/${this.userId}`;
    const docId = await this.firestoreService.getDocumentIdInSubcollection(userIdPath, subcollection);
    if (docId) {
      this.firestoreService.updateDocument(form.value, `${userIdPath}/${subcollection}`, docId).then(() => {
        console.log(`${subcollection} guardado`, form.value);
      });
    } else {
      console.error(`No se encontró documento en la subcolección ${subcollection}`);
    }
  }

   goBack() {
    window.history.back();
  }

}
