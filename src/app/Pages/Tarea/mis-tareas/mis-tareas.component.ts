import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TareaService } from 'src/Services/tarea.service';
import { Itarea } from 'src/app/Models/tarea';
import Swal from 'sweetalert2';
import * as _ from 'lodash';

@Component({
  selector: 'app-mis-tareas',
  templateUrl: './mis-tareas.component.html',
  styleUrls: ['./mis-tareas.component.css'],
  providers: [TareaService]
})
export class MisTareasComponent implements OnInit {
  showForm: boolean;

  constructor(
    private fb: FormBuilder,private TareaService:TareaService
  ) {}
  tasks: Itarea[];
  inputTodo: string = '';
  oldName: string = '';
  oldDate: string = '';

  ngOnInit(): void {
    this.tasks = [];
    this.GetAllTasks();
    this.showForm = false;
  }

  receiveMessage($event){
    this.showForm = $event;
  }

  receiveTaskList($event) {
    this.tasks.push($event);
  }

  ShowForm():void {
    this.showForm = true;
    document.getElementById('popup-tarea-backshadow').style.display = 'block';
  };

  infoForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.required, Validators.minLength(3)]]
  });

  get nombre() {
    return this.infoForm.get('nombre');
  }
  get descripcion() {
    return this.infoForm.get('descripcion');
  };

  GetAllTasks() {
    this.TareaService
      .GetAllTasks()
      .subscribe(allTasks => {
        console.log('allTasks: -->', allTasks);
        this.tasks = allTasks;

        setTimeout(() => {
          MisTareasComponent.SetEvents();
        }, 0)
      });
  };
  
  DeleteTask(tareaId) {
    this.DeleteTaskModal(tareaId)
  }

  private DeleteTaskModal(tareaId: any) {
    Swal.fire({
      title: 'Are you sure want to remove?',
      text: 'You will not be able to recover this file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then(result => {
      if (result.value) {
        this.TareaService.DeleteTarea(tareaId).subscribe(taskDeleted => {
          this.tasks = this.tasks.filter(task => task.tareaId !== tareaId);
        });
        Swal.fire('Deleted!', 'Your task has been deleted.', 'success');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your task is safe :)', 'error');
      }
    });
  }

  static SetEvents() {
    for (let i = 0; i < document.getElementsByClassName('task-card').length; i++) {
      document.getElementsByClassName('task-card')[i].addEventListener('mouseenter', e => {
        let id = (<HTMLInputElement>e.currentTarget).dataset.id;
        document.getElementById('icons-' + id).style.display = 'block'
      })
    }

    for (let i = 0; i < document.getElementsByClassName('task-card').length; i++) {
      document.getElementsByClassName('task-card')[i].addEventListener('mouseleave', e => {
        let id = (<HTMLInputElement>e.currentTarget).dataset.id;
        document.getElementById('icons-' + id).style.display = 'none';
      })
    }
  }


  EditTask(tareaId, oldName, oldFechaComprometida) {
    this.TareaService.GetTaskById(tareaId).subscribe(taskById => {
      this.oldName = oldName;
      this.oldDate = oldFechaComprometida?.toString().split('T')[0];
      this.ResultTaskEdit(tareaId);
    });
  }

  private ResultTaskEdit(tareaId: any) {
    this.EditTaskModal(tareaId).then(result => {
      if (result.isConfirmed) {
        Swal.fire({
          title: `Task edited`
        });

        console.log('result: ', result)
      }
    });
  }

  private EditTaskModal(tareaId: any) {
    return Swal.fire({
     title: 'Edit your task.',
     html: `<input id="swal-input1" class="swal2-input" value="${this.oldName?.toString()}">
            <input id="swal-input2" class="swal2-input" value="${this.oldDate?.toString()}">`,
      showCancelButton: true,
      confirmButtonText: 'Edit',
      showLoaderOnConfirm: true,
      preConfirm: task => {
        this.PreConfirmTask(tareaId, {
          descripcion: (<HTMLInputElement>document.getElementById('swal-input1')).value,
          fechaComprometida: (<HTMLInputElement>document.getElementById('swal-input2')).value,
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    });
  }

  //private EditTaskModal(tareaId: any) {
  //  return Swal.fire({
  //    title: 'Edit your task.',
  //    input: 'text',
  //    inputValue: this.oldName.toString(),
  //    inputAttributes: {
  //      autocapitalize: 'off'
  //    },
  //    showCancelButton: true,
  //    confirmButtonText: 'Edit',
  //    showLoaderOnConfirm: true,
  //    preConfirm: task => {
  //      this.PreConfirmTask(tareaId, task);
  //    },
  //    allowOutsideClick: () => !Swal.isLoading()
  //  });
  //}

  private PreConfirmTask(tareaId: any, task: any) {
    this.TareaService.EditTask(tareaId, task).subscribe(
      tarea => {
        this.tasks = this.tasks.filter(task => task.tareaId != tareaId);
        this.tasks.push(tarea);
        this.tasks = _.orderBy(this.tasks, ['tareaId'], ['asc']);
        setTimeout(() => {
          MisTareasComponent.SetEvents();
        }, 0)
      }
    );
  }

  EditTaskStatus(task) {
    task.statusId ? (task.statusId = 0) : (task.statusId = 1);
    this.TareaService.EditTaskStatus(task.tareaId, {
      descripcion: task.descripcion,
      statusId: task.statusId
    }).subscribe(tarea => {
      console.log('tarea editada: -->', tarea);
    });
  }

}
