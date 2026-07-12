"""Pydantic schemas — request/response contracts.

These mirror the TypeScript interfaces in ``src/data/services.ts``,
``src/data/projects.ts`` and ``src/admin/store.ts``.
"""

from __future__ import annotations

from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints

from typing import Literal

Slug = Annotated[str, StringConstraints(pattern=r"^[a-z0-9][a-z0-9\-_]*$", max_length=120)]
HexColor = Annotated[str, StringConstraints(pattern=r"^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")]
Role = Literal["admin", "team", "client"]


class _Base(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True, extra="forbid")


# ---------------------------------------------------------------------------
# Services
# ---------------------------------------------------------------------------

class ServiceFAQ(_Base):
    q: str
    a: str


class ServicePackage(_Base):
    name: str
    price: str
    cadence: str
    fits: str
    includes: list[str] = Field(default_factory=list)
    featured: bool = False


class ServicePhase(_Base):
    n: str
    title: str
    blurb: str
    out: str


class ServiceDeliverable(_Base):
    title: str
    blurb: str


class ServiceDetail(_Base):
    slug: Slug
    icon: str
    tag: str
    title: str
    short: str
    lede: str
    hero: str
    bullets: list[str] = Field(default_factory=list)
    stat: tuple[str, str]
    hue: HexColor
    visual: str
    image: str | None = None
    video: str | None = None
    meta: list[tuple[str, str]] = Field(default_factory=list)
    deliverables: list[ServiceDeliverable] = Field(default_factory=list)
    phases: list[ServicePhase] = Field(default_factory=list)
    stack: list[str] = Field(default_factory=list)
    packages: list[ServicePackage] = Field(default_factory=list)
    faqs: list[ServiceFAQ] = Field(default_factory=list)
    related: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------

class ProjectMetric(_Base):
    num: str
    label: str


class ProjectSection(_Base):
    title: str
    body: list[str] = Field(default_factory=list)


class ProjectTestimonial(_Base):
    quote: str
    author: str
    role: str


class ProjectImage(_Base):
    src: str
    alt: str | None = None
    caption: str | None = None


class ProjectDetail(_Base):
    slug: Slug
    client: str
    category: str
    industry: str
    title: str
    summary: str
    tags: list[str] = Field(default_factory=list)
    tone: HexColor
    year: str
    duration: str
    team: str
    services: list[str] = Field(default_factory=list)
    hero: str
    metric: tuple[str, str]
    metrics: list[ProjectMetric] = Field(default_factory=list)
    sections: list[ProjectSection] = Field(default_factory=list)
    deliverables: list[str] = Field(default_factory=list)
    stack: list[str] = Field(default_factory=list)
    testimonial: ProjectTestimonial
    visualIdx: int = Field(ge=0, le=10)
    images: list[ProjectImage] = Field(default_factory=list)
    liveUrl: str | None = None


# ---------------------------------------------------------------------------
# Jobs / careers
# ---------------------------------------------------------------------------

class JobDetail(_Base):
    slug: Slug
    title: str
    department: str
    location: str
    type: str
    summary: str
    description: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    requirements: list[str] = Field(default_factory=list)
    applyUrl: str = ""
    postedAt: str
    tone: HexColor


# ---------------------------------------------------------------------------
# Team
# ---------------------------------------------------------------------------

class SocialLink(_Base):
    platform: str
    url: str


class TeamMember(_Base):
    id: str
    name: str
    role: str
    bio: str
    initials: str
    tone: HexColor
    avatar: str | None = None
    socials: list[SocialLink] | None = None


# ---------------------------------------------------------------------------
# Site content (singleton)
# ---------------------------------------------------------------------------

class HeroStat(_Base):
    id: str
    num: str
    label: str


class HeroBrand(_Base):
    id: str
    name: str = ""
    image: str = ""


class HeroContent(_Base):
    badge: str
    headline: str
    headlineAccent: str = ""
    rotatingWords: list[str] = Field(default_factory=list)
    sub: str
    primaryCta: str
    primaryCtaHref: str = ""
    secondaryCta: str
    secondaryCtaHref: str = ""
    ratingText: str = ""
    avatars: list[str] = Field(default_factory=list)
    brands: list[HeroBrand] = Field(default_factory=list)
    stats: list[HeroStat] = Field(default_factory=list)


class CTAContent(_Base):
    eyebrow: str
    title: str
    accentTitle: str
    sub: str
    primary: str
    primaryHref: str = ""
    secondary: str
    secondaryHref: str = ""


class FAQItem(_Base):
    id: str
    q: str
    a: str


class TestimonialItem(_Base):
    id: str
    quote: str
    name: str
    role: str
    tone: HexColor
    image: str | None = None


class MarqueeItem(_Base):
    id: str
    label: str


class ProcessStep(_Base):
    id: str
    icon: str = "Compass"
    title: str
    timeline: str = ""
    blurb: str = ""
    deliverables: list[str] = Field(default_factory=list)


class ProcessContent(_Base):
    eyebrow: str = "How we work"
    title: str = ""
    titleAccent: str = ""
    sub: str = ""
    steps: list[ProcessStep] = Field(default_factory=list)


class SectionIntro(_Base):
    eyebrow: str = ""
    title: str = ""
    titleAccent: str = ""
    sub: str = ""


class FooterLink(_Base):
    id: str
    label: str = ""
    href: str = ""


class FooterColumn(_Base):
    id: str
    title: str = ""
    links: list[FooterLink] = Field(default_factory=list)


class FooterContent(_Base):
    tagline: str = ""
    columns: list[FooterColumn] = Field(default_factory=list)
    legalLinks: list[FooterLink] = Field(default_factory=list)
    copyright: str = ""
    strapline: str = ""


class LegalSection(_Base):
    id: str
    heading: str = ""
    body: str = ""


class LegalDoc(_Base):
    title: str = ""
    updated: str = ""
    # Rich HTML body authored in the admin Legal editor.
    body: str = ""
    # Legacy fields kept so pre-rich-editor content still validates.
    intro: str = ""
    sections: list[LegalSection] = Field(default_factory=list)


class LegalContent(_Base):
    privacy: LegalDoc = Field(default_factory=LegalDoc)
    terms: LegalDoc = Field(default_factory=LegalDoc)


class AboutValue(_Base):
    id: str
    icon: str
    title: str
    blurb: str
    hue: HexColor


class AboutRole(_Base):
    id: str
    title: str
    location: str
    href: str = ""


class AboutMilestone(_Base):
    id: str
    year: str
    what: str


class AboutContent(_Base):
    values: list[AboutValue] = Field(default_factory=list)
    roles: list[AboutRole] = Field(default_factory=list)
    timeline: list[AboutMilestone] = Field(default_factory=list)


class PricingPlan(_Base):
    """One card on the /pricing page. Mirrors ``src/data/pricing.ts``."""

    id: str
    name: str
    info: str = ""
    price: str
    timeline: str = ""
    features: list[str] = Field(default_factory=list)
    cta: str = "Start this project"
    highlighted: bool = False


class PricingService(_Base):
    """One service tab on the /pricing page with its rate card."""

    slug: Slug
    label: str
    hue: HexColor
    plans: list[PricingPlan] = Field(default_factory=list)


class SiteContent(_Base):
    hero: HeroContent
    cta: CTAContent
    faqs: list[FAQItem] = Field(default_factory=list)
    faqSection: SectionIntro | None = None
    testimonials: list[TestimonialItem] = Field(default_factory=list)
    testimonialsSection: SectionIntro | None = None
    marquee: list[MarqueeItem] = Field(default_factory=list)
    process: ProcessContent = Field(default_factory=ProcessContent)
    contactEmail: EmailStr
    about: AboutContent = Field(default_factory=AboutContent)
    footer: FooterContent | None = None
    legal: LegalContent | None = None
    pricing: list[PricingService] | None = None


# ---------------------------------------------------------------------------
# Brand
# ---------------------------------------------------------------------------

class BrandLocation(_Base):
    id: str
    city: str
    tz: str
    detail: str


class BrandSettings(_Base):
    studioName: str
    tagline: str
    contactEmail: EmailStr
    careersEmail: EmailStr
    phone: str = ""
    address: str = ""
    locations: list[BrandLocation] = Field(default_factory=list)
    socials: list[SocialLink] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Client project snapshot — shared between team portal (writes) and client
# dashboard (reads). Mirrors the TypeScript types in src/lib/projectData.ts.
# ---------------------------------------------------------------------------


class PhaseDeliverable(_Base):
    id: str
    label: str
    done: bool = False


class ProjectPhase(_Base):
    id: str
    n: str
    title: str
    status: Literal["done", "active", "next"]
    pct: int = Field(ge=0, le=100)
    startedOn: str | None = None
    endedOn: str | None = None
    deliverables: list[PhaseDeliverable] = Field(default_factory=list)


class ProjectActivity(_Base):
    id: str
    when: str
    whoName: str
    whoInitial: str
    whoTone: HexColor
    what: str
    kind: Literal["design", "build", "copy", "growth", "other"] = "other"


class ProjectStat(_Base):
    id: str
    label: str
    value: str


class ProjectTeamMember(_Base):
    id: str
    name: str
    role: str
    initial: str
    tone: HexColor


class ProjectMilestone(_Base):
    title: str
    date: str
    note: str


class ProjectSnapshot(_Base):
    client: str
    projectName: str
    slug: Slug
    status: Literal["active", "paused", "wrapped"]
    startedOn: str
    targetOn: str
    overallPct: int = Field(ge=0, le=100)
    currentPhaseId: str
    stats: list[ProjectStat] = Field(default_factory=list)
    phases: list[ProjectPhase] = Field(default_factory=list)
    activity: list[ProjectActivity] = Field(default_factory=list)
    team: list[ProjectTeamMember] = Field(default_factory=list)
    nextMilestone: ProjectMilestone


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

Password = Annotated[str, StringConstraints(min_length=8, max_length=200)]
UserName = Annotated[str, StringConstraints(min_length=1, max_length=120)]


class LoginRequest(_Base):
    email: EmailStr
    password: Password


class UserCreate(_Base):
    email: EmailStr
    name: UserName
    role: Role = "client"
    password: Password


class UserPatch(_Base):
    email: EmailStr | None = None
    name: UserName | None = None
    role: Role | None = None
    is_active: bool | None = None
    password: Password | None = None  # write-only; presence means "set a new password"


# ---------------------------------------------------------------------------
# Patch schemas — partial updates for PATCH endpoints.
#
# Every field is optional. ``model_dump(exclude_unset=True)`` returns only the
# fields the client actually sent, so the router can merge against the existing
# row instead of replacing the whole document.
# ---------------------------------------------------------------------------


class BrandSettingsPatch(_Base):
    studioName: str | None = None
    tagline: str | None = None
    contactEmail: EmailStr | None = None
    careersEmail: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    locations: list[BrandLocation] | None = None
    socials: list[SocialLink] | None = None


class SiteContentPatch(_Base):
    hero: HeroContent | None = None
    cta: CTAContent | None = None
    faqs: list[FAQItem] | None = None
    faqSection: SectionIntro | None = None
    testimonials: list[TestimonialItem] | None = None
    testimonialsSection: SectionIntro | None = None
    marquee: list[MarqueeItem] | None = None
    process: ProcessContent | None = None
    contactEmail: EmailStr | None = None
    about: AboutContent | None = None
    footer: FooterContent | None = None
    legal: LegalContent | None = None
    pricing: list[PricingService] | None = None


class TeamMemberPatch(_Base):
    id: str | None = None
    name: str | None = None
    role: str | None = None
    bio: str | None = None
    initials: str | None = None
    tone: HexColor | None = None
    avatar: str | None = None
    socials: list[SocialLink] | None = None


class ServicePatch(_Base):
    slug: Slug | None = None
    icon: str | None = None
    tag: str | None = None
    title: str | None = None
    short: str | None = None
    lede: str | None = None
    hero: str | None = None
    bullets: list[str] | None = None
    stat: tuple[str, str] | None = None
    hue: HexColor | None = None
    visual: str | None = None
    image: str | None = None
    video: str | None = None
    meta: list[tuple[str, str]] | None = None
    deliverables: list[ServiceDeliverable] | None = None
    phases: list[ServicePhase] | None = None
    stack: list[str] | None = None
    packages: list[ServicePackage] | None = None
    faqs: list[ServiceFAQ] | None = None
    related: list[str] | None = None


class ProjectPatch(_Base):
    slug: Slug | None = None
    client: str | None = None
    category: str | None = None
    industry: str | None = None
    title: str | None = None
    summary: str | None = None
    tags: list[str] | None = None
    tone: HexColor | None = None
    year: str | None = None
    duration: str | None = None
    team: str | None = None
    services: list[str] | None = None
    hero: str | None = None
    metric: tuple[str, str] | None = None
    metrics: list[ProjectMetric] | None = None
    sections: list[ProjectSection] | None = None
    deliverables: list[str] | None = None
    stack: list[str] | None = None
    testimonial: ProjectTestimonial | None = None
    visualIdx: int | None = Field(default=None, ge=0, le=10)
    images: list[ProjectImage] | None = None
    liveUrl: str | None = None


class JobPatch(_Base):
    slug: Slug | None = None
    title: str | None = None
    department: str | None = None
    location: str | None = None
    type: str | None = None
    summary: str | None = None
    description: list[str] | None = None
    responsibilities: list[str] | None = None
    requirements: list[str] | None = None
    applyUrl: str | None = None
    postedAt: str | None = None
    tone: HexColor | None = None


class TokenPair(_Base):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int  # seconds until access_token expires


class AdminUserOut(_Base):
    id: str
    email: EmailStr
    name: str
    role: Role
    is_active: bool
    created_at: datetime


# Backwards-compat alias — the table backs all roles now.
UserOut = AdminUserOut


class LoginResponse(_Base):
    user: AdminUserOut
    tokens: TokenPair


class RefreshRequest(_Base):
    refresh_token: str


# ---------------------------------------------------------------------------
# Public site bundle
# ---------------------------------------------------------------------------

class SiteBundle(_Base):
    services: list[ServiceDetail]
    projects: list[ProjectDetail]
    jobs: list[JobDetail] = Field(default_factory=list)
    team: list[TeamMember]
    content: SiteContent
    brand: BrandSettings


# ---------------------------------------------------------------------------
# Uploads
# ---------------------------------------------------------------------------

class UploadResult(_Base):
    url: str
    key: str
    name: str
    content_type: str
    size: int
    renamed: bool = False
    """``True`` when the server auto-suffixed the filename to avoid a collision."""


class UploadItem(_Base):
    """One image as listed by ``GET /admin/uploads``."""

    url: str
    key: str
    name: str
    content_type: str
    size: int
    uploaded_at: datetime | None = None


class UploadList(_Base):
    items: list[UploadItem]
    count: int


# ---------------------------------------------------------------------------
# Contact / leads
# ---------------------------------------------------------------------------

ContactMessage = Annotated[str, StringConstraints(min_length=1, max_length=5000)]


class ContactCreate(_Base):
    name: UserName
    email: EmailStr
    message: ContactMessage
    # Honeypot: a field hidden from real users. Bots tend to fill every input,
    # so a non-empty value marks the submission as spam (silently dropped).
    company_website: str = ""


class LeadOut(_Base):
    id: str
    name: str
    email: EmailStr
    message: str
    is_read: bool
    created_at: datetime


class LeadPatch(_Base):
    is_read: bool | None = None
