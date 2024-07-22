import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule, DividerModule, TimelineModule],
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css', '../../styles.css'],
})
export class GuideComponent {
  @ViewChild('guideContent') guideContent!: ElementRef;

  tocItems = [
    { title: 'Requirement 5', id: 'requirement5', isActive: false },
    { title: 'Picking a Project', id: 'pickingaproject', isActive: false },
    { title: 'Research', id: 'research', isActive: false },
    {
      title: 'Part 1',
      id: 'part1',
      isActive: false,
      sub: [
        {
          id: 'projectdescription',
          title: 'Project Description',
          isActive: false,
        },
        { id: 'givingleadership', title: 'Giving Leadership', isActive: false },
        {
          id: 'materialssuppliestools',
          title: 'Materials, Supplies, Tools',
          isActive: false,
        },
        { id: 'fundraising', title: 'Fundraising', isActive: false },
        { id: 'safety', title: 'Safety', isActive: false },
        { id: 'approval', title: 'Approval', isActive: false },
      ],
    },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    this.guideContent.nativeElement.addEventListener('scroll', () =>
      this.updateActiveSection(),
    );
  }

  onGuideContentScroll() {
    this.updateActiveSection();
  }

  updateActiveSection() {
    if (!this.guideContent) {
      console.log('guideContent is not defined');
      return;
    }

    const sections = this.guideContent.nativeElement.querySelectorAll(
      '.section, .subheader-text, .header-text',
    );
    if (sections.length === 0) {
      console.log('No sections found');
      return;
    }

    let currentActiveId = '';

    sections.forEach((section: any) => {
      const rect = section.getBoundingClientRect();
      const guideContentTop =
        this.guideContent.nativeElement.getBoundingClientRect().top;

      if (
        rect.top >= guideContentTop &&
        rect.top <=
          guideContentTop + this.guideContent.nativeElement.clientHeight / 2
      ) {
        currentActiveId = section.id;
      }
    });

    this.tocItems.forEach((item) => {
      item.isActive = item.id === currentActiveId;
      item.sub?.forEach((subItem) => {
        subItem.isActive = subItem.id === currentActiveId;
      });
    });
  }

  scrollToSection(id: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const section = document.getElementById(id);
      const guideContent = document.getElementById('guideContent');
      console.log('We are about to find both.');
      if (section && guideContent) {
        console.log('We found both.');
        const topPos = section.offsetTop;
        console.log('This is topPos: ' + topPos);
        guideContent.scrollTo({ top: topPos, behavior: 'smooth' });
      }
    }
  }
}
