import { Component, OnInit, ViewChild, AfterViewInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil, forkJoin, filter } from 'rxjs';

import { UsuarioService } from '../../../../core/services/usuario.service';
import { AuthService } from '../../../../core/services/auth.service';
import { UsuarioDetalle } from '../../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../../core/components/confirm-dialog/confirm-dialog.component';
import { UserDialogComponent } from '../../components/user-dialog/user-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export default class UserListComponent implements OnInit, AfterViewInit, OnDestroy {

  // Servicios inyectados
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Propiedades de la tabla
  public displayedColumns: string[] = ['username', 'email', 'roles', 'estado', 'acciones'];
  public dataSource: MatTableDataSource<UsuarioDetalle>;

  // Paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Datos
  private rolesDisponibles: string[] = [];
  public currentUserId: number | null = null;

  // Gestión de observables
  private destroy$ = new Subject<void>();

  constructor() {
    this.dataSource = new MatTableDataSource<UsuarioDetalle>([]);

    // Obtener el ID del usuario actual para evitar la auto-desactivación
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUserId = user?.id ?? null;
    });
  }

  ngOnInit(): void {
    // Cargar usuarios y roles en paralelo
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los usuarios y los roles disponibles desde el backend.
   */
  loadData(): void {
    forkJoin({
      usuarios: this.usuarioService.getUsuarios(),
      roles: this.usuarioService.getRolesDisponibles()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ usuarios, roles }) => {
        this.dataSource.data = usuarios;
        this.rolesDisponibles = roles;
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.snackBar.open('Error al cargar los datos de usuarios.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  /**
   * Aplica un filtro a la tabla
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Abre el diálogo para crear un nuevo usuario.
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: {
        usuario: null, // Modo creación
        roles: this.rolesDisponibles
      },
      disableClose: true // Evitar que se cierre al hacer clic fuera
    });

    dialogRef.afterClosed().pipe(
      filter(result => !!result), // Solo continuar si el usuario guardó (no si canceló)
      takeUntil(this.destroy$)
    ).subscribe(() => {
        // La lógica de creación/actualización está en Tarea 6.11
        // Por ahora, solo recargamos la lista
        this.snackBar.open('Usuario creado (simulación).', 'Cerrar', { duration: 3000, panelClass: 'snack-success' });
        this.loadData();
    });
  }

  /**
   * Abre el diálogo para editar un usuario existente.
   */
  openEditDialog(usuario: UsuarioDetalle): void {
     const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: {
        usuario: usuario, // Modo edición
        roles: this.rolesDisponibles
      },
      disableClose: true
    });

     dialogRef.afterClosed().pipe(
      filter(result => !!result),
      takeUntil(this.destroy$)
    ).subscribe(() => {
        // La lógica de creación/actualización está en Tarea 6.11
        // Por ahora, solo recargamos la lista
        this.snackBar.open('Usuario actualizado (simulación).', 'Cerrar', { duration: 3000, panelClass: 'snack-success' });
        this.loadData();
    });
  }

  /**
   * Abre un diálogo de confirmación para desactivar (borrado lógico) un usuario.
   */
  onDeactivateUser(usuario: UsuarioDetalle): void {
    if (usuario.id === this.currentUserId) {
      this.snackBar.open('No puedes desactivarte a ti mismo.', 'Cerrar', { duration: 3000, panelClass: 'snack-warn' });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Desactivación',
        message: `¿Estás seguro de que deseas desactivar al usuario "${usuario.username}"? El usuario no podrá iniciar sesión.`
      }
    });

    dialogRef.afterClosed().pipe(
      filter(result => !!result), // Solo si el usuario confirmó
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.usuarioService.deleteUsuario(usuario.id).subscribe({
        next: () => {
          this.snackBar.open('Usuario desactivado correctamente.', 'Cerrar', { duration: 3000, panelClass: 'snack-success' });
          this.loadData(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al desactivar usuario:', err);
          this.snackBar.open('Error al desactivar el usuario.', 'Cerrar', { duration: 3000, panelClass: 'snack-error' });
        }
      });
    });
  }
}
