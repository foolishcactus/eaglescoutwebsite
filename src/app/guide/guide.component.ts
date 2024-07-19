import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
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
  tocItems = [
    {
      title: 'Requirement 5',
      id: 'requirement5',
      isActive: false,
    },
    {
      title: 'Picking a Project',
      id: 'pickingaproject',
      isActive: false,
    },
    {
      title: 'Research',
      id: 'research',
      isActive: false,
    },
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

  activeSection: string = '';
  scrollProgress: number = 0;

  constructor() {}

  ngOnInit() {}

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    //const offset = window.scrollY;
    //
    //this.tocItems.forEach(item => {
    //  const element = document.getElementById(item.id);
    //
    //  if (element) {
    //    const rect = element.getBoundingClientRect();
    //    if (rect.top + offset >= offset && rect.bottom + offset <= offset + window.innerHeight) {
    //      this.activeSection = item.id;
    //    }
    //  }
    //});

    this.updateActiveSection();
    this.updateScrollProgress();
  }

  updateActiveSection(): void {
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;

    let activeItemId: any = null;
    let minDiff = Number.MAX_VALUE;

    // First, check main items without subheadings
    this.tocItems.forEach((item) => {
      if (!item.sub) {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const diff = Math.abs(viewportCenter - elementCenter);
          if (diff < minDiff) {
            minDiff = diff;
            activeItemId = item.id;
          }
        }
      }
    });

    // Then, check items with subheadings and their sub-items
    this.tocItems.forEach((item) => {
      if (item.sub) {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const diff = Math.abs(viewportCenter - elementCenter);
          if (diff < minDiff) {
            minDiff = diff;
            activeItemId = item.id;
          }
        }
        item.sub.forEach((subItem) => {
          const subElement = document.getElementById(subItem.id);
          if (subElement) {
            const rect = subElement.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const diff = Math.abs(viewportCenter - elementCenter);
            if (diff < minDiff) {
              minDiff = diff;
              activeItemId = subItem.id;
            }
          }
        });
      }
    });

    // Update the active state
    this.tocItems.forEach((item) => {
      if (item.sub) {
        item.isActive = item.id === activeItemId;
        item.sub.forEach((subItem) => {
          subItem.isActive = subItem.id === activeItemId;
        });
      } else {
        item.isActive = item.id === activeItemId;
      }
    });
  }

  isActive(id: string): boolean {
    return this.activeSection === id;
  }

  scrollToSection(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.scrollY;
      const middle =
        absoluteElementTop - window.innerHeight / 2 + elementRect.height / 2;

      window.scrollTo({
        top: middle,
        behavior: 'smooth',
      });

      // Update the active section after scrolling
      setTimeout(() => {
        this.updateScrollProgress();
        this.updateActiveSection();
      }, 500); // Adjust the timeout duration as needed
    }
  }

  updateScrollProgress(): void {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    this.scrollProgress = (scrollTop / (scrollHeight - clientHeight)) * 100;
  }
}
