import { Component, OnInit } from '@angular/core';
import { Conference } from '../models/conference.model';
import { ConferenceService } from '../services/conference/conference.service';
import { UserStorageService } from '../services/storage/user-storage.service';
import { User, UserDetails } from '../models/user.model';
import { AuthService } from '../services/auth/auth.service';
import { PaiementService } from '../services/paiement/paiement.service';
import { Paiement } from '../models/paiement.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-conference-list',
  templateUrl: './conference-list.component.html',
  styleUrls: ['./conference-list.component.css'],
})
export class ConferenceListComponent implements OnInit {
  conferences: Conference[] = [];
  userId: number;
  doctors: User[] = []; 
  paiements: Paiement[] = [];
  vip:boolean=false;
  matricule:string;
  constructor(
    private conferenceService: ConferenceService,
    private userStorageService: UserStorageService,
    private authService: AuthService,
    private paiementService: PaiementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userStorageService.user$.subscribe((user) => {
      console.log('Received user:', user);
      if (user && user.userId) {
        this.userId = user.userId;
        this.matricule= user.matricule;
        console.log('current id', this.matricule);
      }
    });
    this.getConferences();
    this.getAllParticipants(); 
    this.loadPaiements();
  }

  loadPaiements(): void {
    this.paiementService.getAllPaiements().subscribe((data) => {
      this.paiements = data;
      this.paiements.forEach((paiement) => {
        if (paiement.participant === this.userId) {  
          this.vip = true;  
        }
        console.log(this.vip)
      });     
      console.log('User VIP status:', this.vip);
    });
  }
  

  getConferences(): void {
    this.conferenceService.getConferences().subscribe(
      (data: Conference[]) => {
        this.conferences = data;
        console.log(this.conferences);

        // Iterate through each conference and update participants with full participation details
        this.conferences.forEach((conference) => {
          conference.participantsDetails = conference.participants.map(
            (userId) => {
              const participantUser = this.doctors.find(
                (doctor) => doctor.id === userId
              );

              if (participantUser) {
                // Return the full participation object
                return {
                  user: participantUser,
                  accepted: false, // Set the accepted value as needed, or fetch it from your backend if available
                };
              } else {
                // If user not found, return a default object
                return {
                  user: { id: userId, email: '', name: '', role: null },
                  accepted: false,
                };
              }
            }
          );
        });
      },
      (error) => {
        console.error('Error fetching conferences:', error);
      }
    );
  }

  getAllParticipants(): void {
    this.authService.getAllParticipants().subscribe(
      (data: User[]) => {
        this.doctors = data; // Store all users in the `doctors` array
        console.log(this.doctors); // Debugging to check if doctors are fetched
      },
      (error: any) => {
        console.error('Failed to retrieve doctors:', error);
      }
    );
  }

  participateInConference(conferenceId: number): void {
    const selectedConference = this.conferences.find(
      (conf) => conf.id === conferenceId
    );
    let ids: number[] = [];
    selectedConference.participantsDetails.forEach((participation) => {
      ids.push(participation.user.id);
      console.log('list of ids', participation);
    });
    console.log('list of ids', ids);

    if (!selectedConference) {
      console.error('Conference not found');
      return;
    }

    // Check if user is already a participant by checking the user ID in the participants array
    if (selectedConference.participants.includes(this.userId)) {
      alert('You have already joined this conference.');
      return;
    }

    // Proceed with joining if not already a participant
    this.conferenceService
      .participateInConference(conferenceId, this.userId)
      .subscribe(
        (response) => {
          // Success - re-fetch conferences and update UI
          alert('You have successfully joined the conference!');
          this.getConferences(); // Refresh the list to reflect the change
        },
        (error) => {
          // Handle the error response from backend
          if (error.status === 403) {
            alert('You are already a participant in this conference.');
          } else {
            console.error('Error:', error);
          }
        }
      );
  }

  navigateToConferenceDetail(conferenceId: number): void {
    this.router.navigate(['/conference', conferenceId]); // Navigate to ConferenceDetailComponent
  }
}
