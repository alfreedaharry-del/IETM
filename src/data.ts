export interface ManualPage {
  id: string;
  manualId: string;
  pageNumber: number;
  sectionTitle: string;
  subTitle?: string;
  paragraphs: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
  diagramType?: 'schematic' | 'isometric' | 'wiring' | 'block' | 'gears' | 'handset' | 'terminal'| 'tree';
  isImageBased?: boolean;
  isOcrDone?: boolean;
}

export interface DocumentSection {
  id: string;
  title: string;
  isExpandable: boolean;
  docId?: string; // If single doc
  subDocuments?: {
    id: string;
    title: string;
    docId: string;
  }[];
}

// DOCUMENT_STRUCTURE and MANUALS_INFO are now provided dynamically by the XML
// configuration in `src/assets/config/documents.xml`. This file keeps only
// the shared types and the internal PAGES_DATABASE used by non-PDF content.

export const PAGES_DATABASE: ManualPage[] = [
  // ==================== USER HANDBOOK (Pages 1 to 10) ====================
  {
    id: 'uh_p1',
    manualId: 'user-handbook',
    pageNumber: 1,
    sectionTitle: 'SECTION 1: GENERAL INTRODUCTION',
    subTitle: '1.1 Scope and Application',
    paragraphs: [
      'The Field Telephone Set Model RFT1001 (Make: ELCOM Innovations) is a lightweight, rugged, hand-portable communication instrument. It is designed to operate under harsh tactical field environments, providing reliable voice communication over long distances.',
      'The set can be operated in two distinct signaling modes: Magneto Mode (Local Battery - LB) and Auto Mode (Common Battery - CB). This versatility allows connection either directly to another field telephone set, a manual magneto private branch switchboard (PMBX), or an automatic central exchange (PABX/PSTN).',
      'The casing is molded from high-impact, flame-retardant industrial composite with watertight gaskets to withstand moisture, dust, and shock. Power is supplied by two standard 1.5V D-cell batteries for Local Battery operation.'
    ]
  },
  {
    id: 'uh_p2',
    manualId: 'user-handbook',
    pageNumber: 2,
    sectionTitle: 'SECTION 1: GENERAL INTRODUCTION',
    subTitle: '1.2 Key Features and Interface Layout',
    paragraphs: [
      'The faceplate features high-contrast mechanical labels. The primary components are organized as follows:',
      '1. MAGNETO CRANK HANDLE: Located on the right-hand panel of the telephone casing. Folds flush into the recess when not in operation. Used to generate tactical AC ringing signals.',
      '2. MODE SWITCH: A heavy-duty rotary selection switch on the top panel. It has two positions: MAGNETO (LB) and AUTO (CB).',
      '3. LINE BINDING POSTS (L1 & L2): Rugged, spring-loaded quick-connect terminals designed for field wire (e.g., WD-1/TT) or standard twin-core copper cable.',
      '4. HANDSET ASSEMBLY: Plugs into the waterproof 5-pin receptacle. Features a heavy-duty press-to-talk (PTT) mechanical switch on the handle grip.'
    ]
  },
  {
    id: 'uh_p3',
    manualId: 'user-handbook',
    pageNumber: 3,
    sectionTitle: 'SECTION 2: TECHNICAL SPECIFICATIONS',
    subTitle: '2.1 Quantitative Performance Metrics',
    paragraphs: [
      'The electronic and physical performance attributes of the ELCOM RFT1001 are guaranteed within military operating limits. The operating range varies significantly based on the gauge of cable used.',
      'For typical WD-1/TT tactical field twisted pair, the maximum operable loop distance is approximately 28 kilometers under dry land conditions. When deployed using heavy industrial copper lines, communication is possible up to 45 kilometers.'
    ],
    table: {
      headers: ['Parameter Specification', 'LB (Magneto) Mode Value', 'CB (Auto) Mode Value'],
      rows: [
        ['Operating Voltage', '3.0 V DC (Internal 2x D-cells)', '24V to 60V DC (External Central Line)'],
        ['Ringing Generator Output', '65V - 90V AC at 20Hz (Cranked)', 'Driven by exchange system (External)'],
        ['Ringer Audibility', '80 dBA minimum at 1.5 meters', '80 dBA minimum at 1.5 meters'],
        ['Frequency Bandwidth', '300 Hz to 3400 Hz', '300 Hz to 3400 Hz'],
        ['Line Impedance Rating', '600 Ohms nominal', '600 Ohms nominal'],
        ['Microphone Element', 'Dynamic noise-canceling', 'Dynamic noise-canceling'],
        ['Total Assembly Mass', '3.4 Kilograms (With battery)', '3.1 Kilograms (Without battery)']
      ]
    }
  },
  {
    id: 'uh_p4',
    manualId: 'user-handbook',
    pageNumber: 4,
    sectionTitle: 'SECTION 3: EQUIPMENT PREPARATION',
    subTitle: '3.1 Battery Compartment Loading',
    paragraphs: [
      'To operate the telephone set in MAGNETO (Local Battery) mode, internal dry-cell batteries must be installed. This power supply is utilized strictly to excite the local carbon/dynamic transmitter microphone capsule during voice transmission.',
      'Follow these steps for insertion:',
      '1. Loosen the two spring-loaded captive slotted head screws on the battery compartment hatch located on the upper-left panel.',
      '2. Swing open the hinged protective battery compartment lid.',
      '3. Inspect the rubber sealing gasket for cracks, sand, or debris. Clear if detected.',
      '4. Slide in two high-capacity R20 (D-cell) heavy-duty cylinder batteries, observing correct polarity alignment as molded inside the tray cavity (Positive (+) point inward).',
      '5. Firmly close the hatch and hand-tighten the captive thumbscrews to secure watertight pressure.'
    ],
    diagramType: 'terminal'
  },
  {
    id: 'uh_p5',
    manualId: 'user-handbook',
    pageNumber: 5,
    sectionTitle: 'SECTION 4: MAGNETO MODE OPERATION',
    subTitle: '4.1 Configuration and Ringing Outgoing Calls',
    paragraphs: [
      'Magneto Mode (also known as Local Battery - LB mode) is used for point-to-point connections with another terminal or manual field switchboard (PMBX) without external power.',
      'Procedure for outgoing calls:',
      '1. Rotate the primary MODE rotary Selector on top of the phone to the "MAGNETO" status position.',
      '2. Terminate the field wires by pressing down on the L1 and L2 spring heads, threading stripped wire tips through, and releasing. Ensure insulation is peeled back 15mm.',
      '3. Unfold the rotary magneto generator crank handle on the right panel side.',
      '4. Rotate the crank vigorously clockwise for 3 to 4 complete rotations. This causes the internal gear-train to multiply rotation speed, driving the magneto generator to produce a high-voltage calling current (~75V AC) over the telephone line, triggering the bell on the receiving unit.',
      '5. Lift the Handset, depress and hold down the press-to-talk (PTT) paddle, and call out the target station name.'
    ]
  },
  {
    id: 'uh_p6',
    manualId: 'user-handbook',
    pageNumber: 6,
    sectionTitle: 'SECTION 4: MAGNETO MODE OPERATION',
    subTitle: '4.2 Receiving Calls and Circuit Clearing',
    paragraphs: [
      'Procedure for incoming calls:',
      '1. Upon hearing the mechanical ring sound from the internal polarized bells, quickly lift the handset from its cradle hook.',
      '2. Depress the PTT switch located on the handset center spine. Keep this switch depressed fully to transmit your voice. Release the switch when listening to the caller.',
      '3. To terminate the conversation, release the PTT switch and rest the handset securely back onto the cradle receiver seat. Ensure the handset is seated squarely to depress the mechanical hook plunger, isolating the active receiver loop.'
    ]
  },
  {
    id: 'uh_p7',
    manualId: 'user-handbook',
    pageNumber: 7,
    sectionTitle: 'SECTION 5: AUTO MODE OPERATION',
    subTitle: '5.1 Connection to Automatic Central Battery Switched Lines',
    paragraphs: [
      'In Auto Mode (Common Battery - CB mode), the field telephone relies on power supplied over the copper line loop from the telephone exchange (usually 24V, 48V, or 60V DC). Local batteries are not used in CB mode.',
      'Operation procedures:',
      '1. Prior to line installation, turn the rotary Selector Switch to the "AUTO" status position. This inserts the internal line supervising relay and decoupling capacitors into the loop, while isolating the local hand-crank generator circuit.',
      '2. Affix the line wires L1 and L2 to their respective terminals. Note that polarity is generally auto-corrected by an internal rectifier bridge.',
      '3. Lift the handset from the cradle. This mechanically closes the hook contacts, completing the DC current loop. The central station automatic register detects the low-resistance loop and provides a standard continuous dial tone.',
      '4. If connected to dedicated direct hot-lines, the lift of the handset automatically alerts the central operator or rings the corresponding remote endpoint immediately.'
    ]
  },
  {
    id: 'uh_p8',
    manualId: 'user-handbook',
    pageNumber: 8,
    sectionTitle: 'SECTION 5: AUTO MODE OPERATION',
    subTitle: '5.2 DTMF Keypad Attachment Dialing',
    paragraphs: [
      'When executing calls in Auto Mode connected to standard public telephone networks (PSTN) or automatic PABX exchanges requiring numeric dialing, the optional DTMF keypad unit must be used.',
      'To operate using dialed digits:',
      '1. Connect the mechanical extension keypad connector to the auxiliary port located under the main front slide door.',
      '2. Pick up the handset and verify the audible presence of continuous dial tone.',
      '3. Press the numeric keys sequentially on the robust field keypad. Sidetone pulses will be briefly audible in the receiver during dialing.',
      '4. Once dialing is complete, communication will be connected automatically when the remote user opens their line receiver loop.'
    ]
  },
  {
    id: 'uh_p9',
    manualId: 'user-handbook',
    pageNumber: 9,
    sectionTitle: 'SECTION 6: OPERATIONAL FIELD CHECKS',
    subTitle: '6.1 Quick Diagnostic Routine',
    paragraphs: [
      'To verify the operational status of the RFT1001 set before deploying it into communication networks, perform the following field diagnostic test sequence:',
      '1. LOOPBACK TEST: Short-circuit the binding terminals L1 and L2 by spanning them with a spare length of wire or a screwdriver shaft.',
      '2. Ensure the top mode knob is tuned to the "MAGNETO" channel.',
      '3. Rotate the magneto crank handle slowly. You should feel a very heavy, smooth mechanical resistance on the crank. This confirms the generator and line shunt switch contacts are functioning.',
      '4. Remove the short-circuit wire. Turn the crank handle again. The cranking force required should be significantly lighter, and you should hear the internal bells give a light, rapid mechanical ring (sidetone ringing). If no ring is heard, the bell contacts require adjustment.'
    ]
  },
  {
    id: 'uh_p10',
    manualId: 'user-handbook',
    pageNumber: 10,
    sectionTitle: 'SECTION 6: OPERATIONAL FIELD CHECKS',
    subTitle: '6.2 Handset audio sidetone check',
    paragraphs: [
      'Continuing the quick diagnostic sequence:',
      '5. Blow sharply into the handset microphone while pressing the handset PTT switch. You should hear a clear sound of your breath in the receiver speaker.',
      '6. If no sidetone is audible, check that the internal batteries are correctly loaded, oriented, and hold a total terminal voltage of at least 2.8 Volts DC under load.',
      '7. If sidetone is present but incoming calls fail to ring, inspect the line terminals and make sure they are not short-circuited or resting on moist ground contacts.'
    ]
  },

  // ==================== TECH MANUAL PART 1 - DESCRIPTION (Pages 11 to 20) ====================
  {
    id: 't1_p1',
    manualId: 'tech-1-1',
    pageNumber: 11,
    sectionTitle: 'VOLUME 1: TECHNICAL DESCRIPTION',
    subTitle: '1.1 System Architecture Overview',
    paragraphs: [
      'The ELCOM RFT1001 military field telephone set is designed in accordance with defense communication standards. It integrates local battery (LB) voice and hand-crank magneto ringing generation with common battery (CB) signaling and loop supervision circuits.',
      'The internal hardware architecture consists of five core sub-assemblies:',
      'A. Dynamic Transmitter and High-Efficiency Recipient Handset (Type H-1001/U).',
      'B. Polarized High-Impedance Electromagnetic Ringer Assembly with adjustable pitch bells.',
      'C. Multi-pole rotary mode selector switch with military silver-plated contact sweeps.',
      'D. Hand-cranked AC Magneto Generator with automatic centrifugal short-circuit clutch mechanisms.',
      'E. Hybrid anti-sidetone induction coil module with matching balance resistors and capacitors.'
    ]
  },
  {
    id: 't1_p2',
    manualId: 'tech-1-1',
    pageNumber: 12,
    sectionTitle: 'VOLUME 1: TECHNICAL DESCRIPTION',
    subTitle: '1.2 Operational Circuit Analysis',
    paragraphs: [
      'The RFT1001 uses a specialized hybrid transformer circuit to minimize sidetone. Sidetone is the sound of the speaker\'s own voice heard in their receiver, which can cause them to lower their voice and impair transmission legibility over long lines.',
      'Our primary hybrid transformer balances the local line impedance against an internal carbon network consisting of capacitor C1 (0.22uF, military ceramic) and resistor R1 (330 Ohms). When the speaker speaks, voice currents divide equally. This creates opposing magnetic fields in the balanced primary coils, cancelling the voltage induced in the receiver winding.',
      'In common battery (Auto) mode, active power from the central office line is blocked from saturated induction coil paths by a high-voltage blocking capacitor C2 (2.0uF, metalized polyester, 250V rating) to allow voice band AC transmission without tripping central relays.'
    ]
  },
  {
    id: 't1_p3',
    manualId: 'tech-1-1',
    pageNumber: 13,
    sectionTitle: 'VOLUME 1: TECHNICAL DESCRIPTION',
    subTitle: '1.3 Magneto Generator Physical Operation',
    paragraphs: [
      'The local calling generator consists of a permanent-magnet motor-alternator driven by a precision multiplying spur gear train. The gears have a 1:5 ratio, so turning the handle at 120 RPM rotates the rotor at 600 RPM.',
      'The magnetic stator utilizes high-coercivity AlNiCo metal magnets. The armature is wound with fine copper wire (AWG 40, triple-enamelled) of approximately 4200 turns, and has an internal resistance of 350 Ohms.',
      'Crucially, the assembly features an automatic shunt switch. When the crank is resting, the generator armature winding is entirely disconnected from the line terminal to avoid loading voice signals. Rotating the handle pushes an axial rod against a spring, closing contact contacts to connect the generator directly in series with the outgoing field wire loop.'
    ],
    diagramType: 'block'
  },
  {
    id: 't1_p4',
    manualId: 'tech-1-1',
    pageNumber: 14,
    sectionTitle: 'VOLUME 1: TECHNICAL DESCRIPTION',
    subTitle: '1.4 Polarized AC Ringer Mechanics',
    paragraphs: [
      'The mechanical call alarm consists of a high-sensitivity electromagnetic ringer. The ringer features dual coils wound around soft-iron cores, a permanent biasing magnet, and a pivot armature connected to a central brass clapper shaft.',
      'The biasing magnet establishes a constant static magnetic flux through both iron cores. When alternating calling current (15Hz to 25Hz AC) flows through the coils, the alternating magnetic field reinforces the flux in one pole while weakening it in the other.',
      'This imbalances the armature, causing it to rock. This swings the clapper back and forth to strike two brass alloy bells. The ringer is tuned to respond to voltages as low as 35V AC, while presenting a high impedance (~10k Ohms at 1000Hz) to prevent shunting voice communication.'
    ]
  },
  {
    id: 't1_p5',
    manualId: 'tech-1-1',
    pageNumber: 15,
    sectionTitle: 'VOLUME 1: TECHNICAL DESCRIPTION',
    subTitle: '1.5 Auto-Mode Relay Control Circuit',
    paragraphs: [
      'When the rotary selector switch is placed in the "AUTO" position, the telephone set activates the auto loop supervision circuits.',
      'On raising the handset, the mechanical hook switch plungers release. This closes contacts HS1/1 and HS1/2, inserting the dynamic transmitter bridge circuit directly across the line terminals L1 and L2.',
      'This draws DC loop current from the central exchange, alerting the central office equipment. Simultaneously, the ringer is disconnected from the main loop and connected in series with blocking capacitor C2 to isolate the DC, while remaining sensitive to incoming 90V 20Hz AC ringing frequencies.'
    ]
  },
  {
    id: 't1_p6',
    manualId: 'tech-1-1',
    pageNumber: 16,
    sectionTitle: 'VOLUME 1: TECHNICAL DESCRIPTION',
    subTitle: '1.6 Dynamic Handset H-1001/U Characteristics',
    paragraphs: [
      'The handset comprises a light, high-impact thermoplastic grip enclosing a heavy receiver capsule, a dynamic noise-canceling transmitter capsule, and a press-to-talk (PTT) spring lever switch.',
      'The dynamic transducer capsule utilizes an ultra-lightweight aluminized polyester diaphragm attached to a copper voice coil. The coil is suspended in a powerful radial magnetic field generated by an neodymium-boron core.',
      'This dynamic design yields stable frequency response over the crucial vocal range of 300 to 3400 Hz, with very low distortion under high ambient noise conditions compared to older carbon granules microphones.',
      'The PTT switch is equipped with thick gold-plated contacts to ensure low contact resistance (<15 milliohms) across thousands of operations.'
    ]
  },
  {
    id: 't1_p7',
    manualId: 'tech-1-1',
    pageNumber: 17,
    sectionTitle: 'VOLUME 1: TECHNICAL DESCRIPTION',
    subTitle: '1.7 Surge and Lightning Protection Circuits',
    paragraphs: [
      'Due to standard tactical deployment involving long, exposed overhead wire loops in active battlefield climates, the RFT1001 is heavily protected against transient high-voltage surge phenomena.',
      'Protection is achieved using a dual-stage safety circuit connected immediately across the line entry L1/L2 terminals:',
      '1. GAS DISCHARGE TUBE (GDT): A primary, heavy-duty ceramic gas discharge tube (Type GDT-1001) filled with an argon-neon gas mix. It strikes when line voltage exceeds 230V, shorting excess currents to the ground/chassis ground terminal.',
      '2. VARISTOR MATCHES: Secondary high-speed metal-oxide varistors (MOV-1 & MOV-2) are wired directly in parallel across the speech circuits, clamping any residual voltages to safe operational levels (<15V) to protect the user\'s hearing.'
    ]
  },
  {
    id: 't1_p8',
    manualId: 'tech-1-1',
    pageNumber: 18,
    sectionTitle: 'VOLUME 1: TECHNICAL DESCRIPTION',
    subTitle: '1.8 Environmental Protection and Resilience',
    paragraphs: [
      'The overall mechanical layout is designed to conform with MIL-STD-810G requirements for environmental resilience.',
      'The housing shell is constructed of fiberglass-reinforced polycarbonate (3.2mm structural wall thickness) with an integrated rubber seal on the primary mating lid seams. All mechanical knobs (Mode Rotary Selector and Magneto crank shaft) are equipped with high-performance silicone O-rings.',
      'Internal circuitry is completely encapsulated under a thick layer of moisture-proof and chemical-resistant conformal epoxy polyurethane coating, shielding the surface-mount and passive elements from mold growth, fungus, salt-spray fog, and high humidity climates.'
    ]
  },
  {
    id: 't1_p9',
    manualId: 'tech-1-1',
    pageNumber: 19,
    sectionTitle: 'VOLUME 1: TECHNICAL DESCRIPTION',
    subTitle: '1.9 Mechanical Hook-Switch Architecture',
    paragraphs: [
      'The handset cradle recess incorporates dual mechanical plunger actuators. These spring-loaded pins translate vertically when the handset is placed in or lifted from the cradle.',
      'The downward stroke forces a multi-leaf contact sprag block to slide down. This breaks the main transmission and loop signaling circuit, isolating the transmitter and receiver. Concurrently, it connects the high-impedance AC ringer circuit in readiness for incoming alert signals.',
      'The contact blades are fabricated from phosphor bronze with solid silver-palladium clad tips to prevent oxidation even when exposed to high moisture environments.'
    ]
  },
  {
    id: 't1_p10',
    manualId: 'tech-1-1',
    pageNumber: 20,
    sectionTitle: 'VOLUME 1: TECHNICAL DESCRIPTION',
    subTitle: '1.10 Key Connector Interface Specifications',
    paragraphs: [
      'The rear-facing recess contains two binding posts and an auxiliary connector.',
      'The main binding posts utilize an insulated high-grip clamping structure designed to receive bare wire stripping diameters ranging from 0.8mm to 2.5mm.',
      'The auxiliary port is a standardized circular 7-pin military receptacle (NATO Type U-77/U). Pins are mapped as:',
      'Pin A: Ground contact; Pin B: Keypad transmitter pulse hook; Pin C & D: External head-gear audio input; Pin E & F: Remote terminal relay signal; Pin G: Keypad continuous DC supply voltage.'
    ]
  },

  // ==================== TECH MANUAL PART 1 - DRAWINGS (Pages 21 to 28) ====================
  {
    id: 't1d_p1',
    manualId: 'tech-1-2',
    pageNumber: 21,
    sectionTitle: 'VOLUME 2: ENGINEERING DRAWINGS',
    subTitle: '2.1 Frame Layout and Component Architecture',
    paragraphs: [
      'The structural layout of the RFT1001 indicates a centralized, compact frame designed to facilitate fast field disassembly.',
      'The layout contains the central faceplate, the battery housing tray, the dynamic receiver handset, and the right-hand crank port. Dual binding posts are located at the upper-right corner adjacent to the ground terminal post.'
    ],
    diagramType: 'isometric'
  },
  {
    id: 't1d_p2',
    manualId: 'tech-1-2',
    pageNumber: 22,
    sectionTitle: 'VOLUME 2: ENGINEERING DRAWINGS',
    subTitle: '2.2 Circuit Wiring Schematic - Magneto Operation Loop',
    paragraphs: [
      'The diagram below details the active signal paths during magneto ringing operations. The rotary selector is turned to local battery. Turning the hand-crank closes shunt contacts, directing high-frequency AC current directly across lines L1 and L2.'
    ],
    diagramType: 'schematic'
  },
  {
    id: 't1d_p3',
    manualId: 'tech-1-2',
    pageNumber: 23,
    sectionTitle: 'VOLUME 2: ENGINEERING DRAWINGS',
    subTitle: '2.3 System Block Connections',
    paragraphs: [
      'The block diagram illustrates the interface points between the primary functional blocks: Handset H-1001/U, Auxiliary DTMF unit, Mode selector switch, active balanced transformer, polarized ringer coil, and magneto generator.'
    ],
    diagramType: 'block'
  },
  {
    id: 't1d_p4',
    manualId: 'tech-1-2',
    pageNumber: 24,
    sectionTitle: 'VOLUME 2: ENGINEERING DRAWINGS',
    subTitle: '2.4 Magneto Generator Gear Train Assembly',
    paragraphs: [
      'Detailed mechanical drafting of the multiplier gear housing assembly. Illustrated are the central drive axle, the primary brass spur cog (45 teeth), the intermediate hardened steel pinion (9 teeth), the secondary gear, and the centrifugal throw contact.',
      'A leaf selector assembly detects rotation. It closes contact shunts only when active clockwise torque is applied to the main handle.'
    ],
    diagramType: 'gears'
  },
  {
    id: 't1d_p5',
    manualId: 'tech-1-2',
    pageNumber: 25,
    sectionTitle: 'VOLUME 2: ENGINEERING DRAWINGS',
    subTitle: '2.5 Handset H-1001/U Exploded Physical View',
    paragraphs: [
      'Technical illustration of the handset shell assembly. It displays the upper receiver cap (threaded, with sealing gasket), the dynamic receiver capsule, the dynamic microphone noise-canceling element, the press-to-talk mechanical bar structure, and the heavy-duty coiled cord connection.'
    ],
    diagramType: 'handset'
  },
  {
    id: 't1d_p6',
    manualId: 'tech-1-2',
    pageNumber: 26,
    sectionTitle: 'VOLUME 2: ENGINEERING DRAWINGS',
    subTitle: '2.6 Binding Terminal Block Drafting',
    paragraphs: [
      'The diagram shows a cross-section of the L1 and L2 quick-connect binding posts. Under tension of internal helical steel springs, the red and black clamp buttons slide downwards, trapping the field wires securely inside the gold-plated mechanical slot.'
    ],
    diagramType: 'terminal'
  },
  {
    id: 't1d_p7',
    manualId: 'tech-1-2',
    pageNumber: 27,
    sectionTitle: 'VOLUME 2: ENGINEERING DRAWINGS',
    subTitle: '2.7 Combined Circuit Wire Schematic - Complete Interface',
    paragraphs: [
      'The full master schematic drawing of the RFT1001. This drawing brings together all sub-components, showing the multi-contact hook switch blocks, the lightning surge arresters, the balanced transformer windings, and the rotary selector contacts.'
    ],
    diagramType: 'wiring'
  },
  {
    id: 't1d_p8',
    manualId: 'tech-1-2',
    pageNumber: 28,
    sectionTitle: 'VOLUME 2: ENGINEERING DRAWINGS',
    subTitle: '2.8 Product Tree Schematic',
    paragraphs: [
      'A structured schematic representation of the physical hierarchy of the complete system, from major case components to electronic capacitors and ringer windings.'
    ],
    diagramType: 'tree'
  },

  // ==================== TECH MANUAL PART 2 - MAINTENANCE (Pages 29 to 38) ====================
  {
    id: 't2_p1',
    manualId: 'tech-2',
    pageNumber: 29,
    sectionTitle: 'PART 2: MAINTENANCE PROCEDURES',
    subTitle: '1.1 Maintenance Schedule and Inspections',
    paragraphs: [
      'To ensure high field availability of calling terminals and error-free voice transmission, a regular preventive maintenance schedule must be followed by technical personnel.',
      'The maintenance schedule is divided into daily, weekly, and monthly tasks, which are described in the following sections of this manual.',
      'DAILY ROUTINE: Perform a visual inspection of the outer casing, handset connection cord, and spring-loaded binding posts L1 and L2. Verify that there is no dirt or humidity on the terminals.',
      'WEEKLY ROUTINE: Run the diagnostic loopback test described in Section 6.1 of the User Handbook. Confirm that magneto resistance is felt and that the ringer rings.'
    ]
  },
  {
    id: 't2_p2',
    manualId: 'tech-2',
    pageNumber: 30,
    sectionTitle: 'PART 2: MAINTENANCE PROCEDURES',
    subTitle: '1.2 Battery Terminal Cleaning and Care',
    paragraphs: [
      'Inspecting and cleaning battery compartments is a core monthly maintenance task:',
      '1. Open the battery compartment hatch door and remove the dry cells.',
      '2. Inspect the copper spring contacts. If white or green crusty deposits (alkaline corrosion) are visible, apply a small amount of household white vinegar or mild dilution citric acid using a soft brush.',
      '3. Gently scrub until all oxide residue is neutralized and dissolved. Clean with a dry cloth and allow to dry thoroughly.',
      '4. Polish the clean contacts using standard fine-grade emery cloth/sandpaper until the metallic surface is clean and shiny.',
      '5. Lightly coat the metal contacts with protective electrical grease.'
    ]
  },
  {
    id: 't2_p3',
    manualId: 'tech-2',
    pageNumber: 31,
    sectionTitle: 'PART 2: MAINTENANCE PROCEDURES',
    subTitle: '1.3 Handset Cord Check and Reconditioning',
    paragraphs: [
      'The handset coiled cord is a high-wear component that can develop intermittent connections over time.',
      'Inspection workflow:',
      '1. Visually check the cord outer sheath for cracks or wear.',
      '2. Connect the telephone to another operational unit in local battery mode.',
      '3. While speaking, continuously stretch, bend, and twist the coiled cord, particularly where it enters the handset grip and the main housing.',
      '4. If static noise occurs or communication drops out, the cord must be replaced.',
      '5. To replace, loosen the handset terminal screws inside the handset housing, detach the wire terminals, pull out the strain relief tail, and insert the replacement cord block.'
    ]
  },
  {
    id: 't2_p4',
    manualId: 'tech-2',
    pageNumber: 32,
    sectionTitle: 'PART 2: MAINTENANCE PROCEDURES',
    subTitle: '1.4 Polarized Ringer Adjustment - Hammer Alignment',
    paragraphs: [
      'If the vertical mechanical ringer gives a muffled ring or fails to ring when receiving calling AC current, the striker hammer may be misaligned.',
      'Adjustment steps:',
      '1. Loosen the physical locknut holding the two bells on the face plate frame.',
      '2. Rotate the eccentric bells slightly to adjust the clearance between the clapper hammer and the inner edge of each bell.',
      '3. The optimal distance is 0.5 mm on both sides. A standard wire feeler gauge should pass through with a light friction feel.',
      '4. Hold the bell firmly in position and retighten the locking nut.',
      '5. Crank the magneto handle under loopback to verify that a loud, clear sound is produced.'
    ]
  },
  {
    id: 't2_p5',
    manualId: 'tech-2',
    pageNumber: 33,
    sectionTitle: 'PART 2: MAINTENANCE PROCEDURES',
    subTitle: '1.5 Magneto Drive Gear Lubrication',
    paragraphs: [
      'The mechanical gear train running from the magneto crank shaft to the rotor pinion requires regular lubrication to prevent tooth wear and heavy winding resistance.',
      'Lubrication procedure:',
      '1. Unscrew the four recessed slotted screws on the corners of the main control faceplate, and carefully lift the panel outward.',
      '2. Locate the brass and steel gears of the magneto assembly.',
      '3. Clean existing grease using a clean rag dipped in dry solvent (Type WD-40 or equivalent degreaser).',
      '4. Apply 2-3 drops of synthetic low-temperature mechanical grease (Type MIL-G-23827) directly onto the gears.',
      '5. Turn the crank handle slowly twenty times to distribute the lubricant smoothly across all gear teeth. Do not over-grease, as excess can migrate onto electrical contacts.'
    ]
  },
  {
    id: 't2_p6',
    manualId: 'tech-2',
    pageNumber: 34,
    sectionTitle: 'PART 2: MAINTENANCE PROCEDURES',
    subTitle: '2.1 Comprehensive Troubleshooting Matrix',
    paragraphs: [
      'The table below summarizes common symptoms encountered during field operations, along with probable causes and step-by-step corrective actions.'
    ],
    table: {
      headers: ['Symptom Code', 'Observed Defect', 'Probable Cause', 'Corrective Action'],
      rows: [
        ['ERR-01', 'No sidetone in handset; cannot transmit voice', 'Local batteries flat or inserted incorrectly; PTT contact dirty', 'Check battery orientation; replace with fresh D-cells; clean PTT gold leaf contacts.'],
        ['ERR-02', 'Incoming call does not ring; dial/voice works ok', 'Ringer clapper gap too wide; line wire leakage to ground', 'Adjust eccentric bells to 0.5mm clearance; trace field lines for ground contact.'],
        ['ERR-03', 'Loud static noise when moving handset cord', 'Coiled cord wire strand broken inside sheath', 'Disconnect handset plug; replace cord unit with replacement spare.'],
        ['ERR-04', 'Crank handles slips; generator armature does not spin', 'Centrifugal clutch mechanism stuck or gear tooth sheared', 'Open faceplate; inspect gears; clean clutch pads with contact solvent.'],
        ['ERR-05', 'Total loss of audio and dialing on common battery line', 'Surge protection gas tube (GDT) short-circuited by strike', 'Inspect GDT-1001 gas tube; if black or scorched, unscrew and replace.']
      ]
    }
  },
  {
    id: 't2_p7',
    manualId: 'tech-2',
    pageNumber: 35,
    sectionTitle: 'PART 2: MAINTENANCE PROCEDURES',
    subTitle: '2.2 Microphonic Capsule Replacement',
    paragraphs: [
      'The noise-canceling dynamic transmitter capsule (Type DN-20) is susceptible to liquid ingress or mechanical damage during rain or high-wind operations.',
      'Replacement protocol:',
      '1. Unscrew the bottom cap of the handset shell using the dynamic spanner tool.',
      '2. Tip the handset downward to drop out the microphone capsule.',
      '3. Disconnect the two wire terminals. Note that red matches terminal (+) and blue matches terminal (-).',
      '4. Clean the inner seat of handset and inspect the rubber acoustic partition ring.',
      '5. Fasten the wire tabs to the new capsule, insert it back into the rubber housing, and screw the bottom cap on firmly to ensure water tightness.'
    ]
  },
  {
    id: 't2_p8',
    manualId: 'tech-2',
    pageNumber: 36,
    sectionTitle: 'PART 2: MAINTENANCE PROCEDURES',
    subTitle: '2.3 Gas Discharge Tube (GDT) Testing',
    paragraphs: [
      'Whenever the telephone set has been exposed to nearby lightning storm events, test the surge protection Gas Discharge Tube (GDT-1001):',
      '1. Remove the protective GDT mounting screw cap on the bottom surface of the main enclosure.',
      '2. Slide out the small cylindrical gas tube module.',
      '3. Use a high-voltage insulation tester (Megger set to 250V range). Measure the dynamic striking voltage across the two outer nodes.',
      '4. The tube should read infinite resistance. If it reads less than 10 Megohms, the gas tube has failed (fired permanently to protect circuits) and must be discarded.'
    ]
  },
  {
    id: 't2_p9',
    manualId: 'tech-2',
    pageNumber: 37,
    sectionTitle: 'PART 2: MAINTENANCE PROCEDURES',
    subTitle: '3.1 Post-Maintenance Verification Checklist',
    paragraphs: [
      'Following any intervention or repair work, run a verification checklist to confirm the unit is ready for redeployment.',
      '1. Insulation resistance test: Measure resistance between Line 1 and chassis ground using 500V. It must exceed 50 Megohms.',
      '2. Ringing current output check: Connect a 1000 Ohm resistor load across L1/L2. Crank the generator at 120 RPM. Output AC voltage must read at least 45V AC across the resistor.',
      '3. Audibility test: Verify incoming ring level is loud and easily audible at least 15 meters away.'
    ]
  },
  {
    id: 't2_p10',
    manualId: 'tech-2',
    pageNumber: 38,
    sectionTitle: 'PART 2: MAINTENANCE PROCEDURES',
    subTitle: '3.2 Storage and Preservation Requirements',
    paragraphs: [
      'When placing RFT1001 units into storage:',
      '- ALWAYS remove the internal D-cell batteries. Batteries left inside for months can leak potassium hydroxide, which corrodes the composite frame and wiring harness.',
      '- Rotate the top mode switch to the "MAGNETO" status. This isolates internal capacitors from line-induced static charges during shelf storage.',
      '- Store in a climate-controlled room with temperature between -10 degrees C and +45 degrees C, and relative humidity less than 75% non-condensing.'
    ]
  },

  // ==================== TECH MANUAL PART 3 - OVERHAULING (Pages 39 to 48) ====================
  {
    id: 't3_p1',
    manualId: 'tech-3',
    pageNumber: 39,
    sectionTitle: 'PART 3: OVERHAULING PROCEDURES',
    subTitle: '1.1 Deep Disassembly of Key Subassemblies',
    paragraphs: [
      'This section describes the tools and procedures for deep overhaul and rebuilding of the ELCOM RFT1001 telephone set.',
      'The overhaul process must be executed by authorized workshop depots equipped with static protection mats, soldering stations, calibrated voltage meters, and physical torque drivers.',
      'Required Tools include: Captive plate wrench, dynamic spanner kit, calibrated torque screwdrivers (1.2 to 4.5 Nm), solder extractor, and structural alignment blocks.'
    ]
  },
  {
    id: 't3_p2',
    manualId: 'tech-3',
    pageNumber: 40,
    sectionTitle: 'PART 3: OVERHAULING PROCEDURES',
    subTitle: '1.2 Demounting Faceplate Components',
    paragraphs: [
      'Disassembling the faceplate module:',
      '1. Place the phone assembly on an ESD dissipative workbench.',
      '2. Release the four captive faceplate mount screws. Lift the block assembly vertically to expose the internal wiring harness plugs.',
      '3. Carefully disconnect the 10-pin block wiring harness connecting the hook switch and ringer coils to the main board PCB.',
      '4. Disconnect the coaxial plug leading from the magneto generator terminal taps.',
      '5. The faceplate panel can now be moved from the lower casing base for individual servicing or component replacement.'
    ]
  },
  {
    id: 't3_p3',
    manualId: 'tech-3',
    pageNumber: 41,
    sectionTitle: 'PART 3: OVERHAULING PROCEDURES',
    subTitle: '1.3 Magneto Re-magnetization Protocol',
    paragraphs: [
      'Diminishing ringer output is often due to aging AlNiCo magnets in the magneto generator losing their magnetic flux density.',
      'Reconditioning the permanent magnets:',
      '1. Extract the magneto generator subassembly from its lower mounting cradle bracket.',
      '2. Mount the rotor block assembly on the electromagnetic re-magnetizer fixture.',
      '3. Align the magnetic poles (North to South) with the re-magnetizing coil pins.',
      '4. Apply a single 1500 Amp-turn DC pulse from the re-magnetizer capacitor bank.',
      '5. Measure the magnetic flux using a calibrated gaussmeter. Remotes must read at least 1500 Gauss on the pole face. If low, repeat the pulse charging sequence.'
    ]
  },
  {
    id: 't3_p4',
    manualId: 'tech-3',
    pageNumber: 42,
    sectionTitle: 'PART 3: OVERHAULING PROCEDURES',
    subTitle: '1.4 Hook Switch Re-alignment and Leaf Replacement',
    paragraphs: [
      'The sliding mechanical hook switch block controls loops during mode shifts. Contacts can bend during rough handle rest drops.',
      'Overhaul procedure:',
      '1. Desolder the connections leading from hook contacts leaf stack to the main board.',
      '2. Undo the mechanical retaining bracket screws to extract the hook switch leaf assembly.',
      '3. Inspect contact blades for bending. Use a contact adjusting tool to gently bend contacts back.',
      '4. The contact gap when open must read 1.2 mm min. The overlapping swipe contact leaf must slide with a self-cleaning movement of 0.4 mm.',
      '5. Solder contacts back using lead-free silver alloy solder wire and clean flux.'
    ]
  },
  {
    id: 't3_p5',
    manualId: 'tech-3',
    pageNumber: 43,
    sectionTitle: 'PART 3: OVERHAULING PROCEDURES',
    subTitle: '1.5 Ringer Coil Rewinding Specifications',
    paragraphs: [
      'If the polarized ringer coils are burned out by accidental connection to high-voltage power lines, they must be rewound inside the workshop:',
      '1. Solder off the wire terminals and dismantle the ringer coils.',
      '2. Peel off the protective polyimide tape and slide off the burned wire coils from their iron cores.',
      '3. Clamp the empty core bobbin onto the magnetic winding machine.',
      '4. Load AWG 38 polyurethane insulated wire. Configure the counter to 5000 turns.',
      '5. Run the winding machine at a constant tension of 35 grams. Wind the wire uniformly to avoid wire crossovers or core pinches.',
      '6. Wrap the finished wire bobbins in double layers of protective heat-proof tape. Solder copper connection wire leads to the terminal pins.'
    ]
  },
  {
    id: 't3_p6',
    manualId: 'tech-3',
    pageNumber: 44,
    sectionTitle: 'PART 3: OVERHAULING PROCEDURES',
    subTitle: '1.6 Hermetic Case Re-sealing Process',
    paragraphs: [
      'Maintaining watertight integrity under deep water immersion (1 meter depth for 2 hours) is a critical requirement:',
      '1. Strip all old rubber seal beads from the lid grooves.',
      '2. Clean the grooves thoroughly with isopropyl alcohol (99% pure) to clear dirt or residual glue.',
      '3. Position a new custom molded neoprene sealing gasket (Part No. EG-3200) into the groove, paying care to avoid stretch or fold nodes.',
      '4. Coat the mating surface of gasket with silicone lubricant sealant.',
      '5. Assemble the casing halves. Torque the sealing screws to 3.5 Nm. Verify water resistance by leak-testing container under pressurized dry nitrogen air.'
    ]
  },
  {
    id: 't3_p7',
    manualId: 'tech-3',
    pageNumber: 45,
    sectionTitle: 'PART 3: OVERHAULING PROCEDURES',
    subTitle: '1.7 Main Circuit Board (PCB) Component Replacement',
    paragraphs: [
      'The master control electrical circuit features dynamic impedance components:',
      '- Induction transformer coil (T1) resistance rating:',
      '  - Winding P1 (pins 1-2): 12.4 Ohms +/- 5%',
      '  - Winding P2 (pins 3-4): 24.8 Ohms +/- 5%',
      '  - Winding S1 (pins 5-6): 54.2 Ohms +/- 5%',
      '- If resistance values deviate, the transformer is faulty and must be desoldered and replaced.',
      '- Capacitors C1 and C2 must be tested for capacitance and equivalent series resistance (ESR). Replace if C2 is less than 1.8uF.'
    ]
  },
  {
    id: 't3_p8',
    manualId: 'tech-3',
    pageNumber: 46,
    sectionTitle: 'PART 3: OVERHAULING PROCEDURES',
    subTitle: '2.1 Post-Overhaul Quality Assurance Protocols',
    paragraphs: [
      'All overhauled units must undergo formal testing, and results record sheets must be logged in the depot ledger.',
      'The testing sequence involves testing in three stages: Audio Quality assessment, Signaling Voltage validation, and Environmental Pressure testing.'
    ],
    table: {
      headers: ['QA Step', 'Test Target Parameter', 'AQL Accept Limit', 'Measurement Tooling'],
      rows: [
        ['QA-01', 'Active Loop Insulation', '100 Megohms min at 500V DC', 'Insulation Tester / Megger'],
        ['QA-02', 'Magneto Ringing Volt', '75V AC minimum into 1.2k Ohm', 'Digital Storage Oscilloscope'],
        ['QA-03', 'Harmonic Voice Distortion', 'Less than 3% at 1000Hz (1mW)', 'Audio Analyzer System'],
        ['QA-04', 'Ringer Strike Rate', '16 to 22 strikes per second', 'Stroboscopic Rate Meter'],
        ['QA-05', 'Watertight Enclosure seal', 'No leak bubbling at 0.5 Bar', 'Pressure Decay Chamber']
      ]
    }
  },
  {
    id: 't3_p9',
    manualId: 'tech-3',
    pageNumber: 47,
    sectionTitle: 'PART 3: OVERHAULING PROCEDURES',
    subTitle: '2.2 Calibration of Ringer Bias Magnets',
    paragraphs: [
      'To verify the correct magnetic attraction force of the polarized ringer assembly magnets:',
      '1. Clamp the physical ringer frame onto the magnet force balance fixture.',
      '2. Attach the mechanical force loader clamp to the moving armature swing point.',
      '3. Pull the armature slowly away from the iron core. Measure the force required to break contact.',
      '4. The release pull force must be between 180 and 220 grams.',
      '5. If the pull is weak, recharge the bias magnet blocks. If the pull is too heavy, demagnetize the core slightly using a small AC coil.'
    ]
  },
  {
    id: 't3_p10',
    manualId: 'tech-3',
    pageNumber: 48,
    sectionTitle: 'PART 3: OVERHAULING PROCEDURES',
    subTitle: '3.1 Re-assembly of Outer Accessories',
    paragraphs: [
      'Completing the overhaul process:',
      '1. Reinstall the dynamic hand generator inside the bottom case, matching the rubber isolation bushes.',
      '2. Fasten the multi-point wiring harness securely to the board pins.',
      '3. Re-orient the top selector knob on its mechanical switch shaft. Check that pointer labels align with active switch positions.',
      '4. Secure the metal clip handle strap brackets to the top outer casing using split lockwashers and screws, torqueing to 2.8 Nm.'
    ]
  },

  // ==================== PARTS LIST PART 4 (Pages 49 to 54) ====================
  {
    id: 't41_p1',
    manualId: 'tech-4-1',
    pageNumber: 49,
    sectionTitle: 'VOLUME 1: COMPONENT CODE CATALOG',
    subTitle: '1.1 Index of Structural and Mechanical Parts',
    paragraphs: [
      'This section contains a comprehensive component code catalog for the ELCOM RFT1001. When ordering replacement parts, always specify the Part Number, Description, and National Stock Number (NSN) listed.'
    ],
    table: {
      headers: ['Part Number', 'NSN Item Code', 'Component Description', 'Unit Qty', 'Reference'],
      rows: [
        ['EC-MC-320', '5805-01-209-4320', 'Fiberglass Main Base Casing Shell', '1', 'Base Assembly'],
        ['EC-FP-321', '5805-01-209-4321', 'Anodized Faceplate Plate Panel', '1', 'Top Cover'],
        ['EC-HS-100', '5965-01-210-9880', 'Handset H-1001/U Complete Assembly', '1', 'Handset Block'],
        ['EC-MG-600', '5805-01-210-9883', 'AC Magneto Generator Assembly', '1', 'Ringer Generator'],
        ['EC-CH-412', '5340-01-211-1200', 'Crank Handle Arm (Folding Type)', '1', 'Generator Side'],
        ['EC-RG-500', '5965-01-210-9902', 'Polarized Ringing Bell Assembly', '1', 'Alarm Sounder']
      ]
    }
  },
  {
    id: 't41_p2',
    manualId: 'tech-4-1',
    pageNumber: 50,
    sectionTitle: 'VOLUME 1: COMPONENT CODE CATALOG',
    subTitle: '1.2 Electrical Hardware and PCB Componetry',
    paragraphs: [
      'Details of replacement electrical components mounted on the main circuit board. These must match military spec ratings.'
    ],
    table: {
      headers: ['Part Number', 'NSN Item Code', 'Component Description', 'Unit Qty', 'Circuit Code'],
      rows: [
        ['EC-TX-101', '5950-01-214-4321', 'Balanced Audio Anti-Sidetone Transformer', '1', 'T1'],
        ['EC-CAP-02', '5910-01-214-5544', 'Capacitor Ceramic 0.22uF 100V', '1', 'C1'],
        ['EC-CAP-20', '5910-01-214-5545', 'Capacitor Metalized Poly 2.0uF 250V', '1', 'C2'],
        ['EC-MOV-15', '5920-01-215-1102', 'Metal-Oxide Varistor 15V Clamping', '2', 'MOV-1, MOV-2'],
        ['EC-GDT-23', '5920-01-215-1105', 'Argon-Neon Gas Discharge Tube 230V', '1', 'GDT-1']
      ]
    }
  },
  {
    id: 't41_p3',
    manualId: 'tech-4-1',
    pageNumber: 51,
    sectionTitle: 'VOLUME 1: COMPONENT CODE CATALOG',
    subTitle: '1.3 Handset Parts and Accessories',
    paragraphs: [
      'Individual items for the H-1001/U handset unit. Items are fully swappable.'
    ],
    table: {
      headers: ['Part Number', 'Item Code', 'Component Description', 'Unit Qty', 'Reference'],
      rows: [
        ['EC-HC-101', '5965-01-220-4322', 'Thermoset Handset Handle Body (Green)', '1', 'Handset Housing'],
        ['EC-RC-102', '5965-01-220-4323', 'Threaded Receiver Ear Cup Cap', '1', 'Handset Ear'],
        ['EC-TC-103', '5965-01-220-4324', 'Threaded Transmitter Mouth Cup Cap', '1', 'Handset Mouth'],
        ['EC-RX-55', '5965-01-220-4325', 'Dynamic Receiver Capsule Unit 150R', '1', 'SPK-1'],
        ['EC-TX-56', '5965-01-220-4326', 'Noise-Cancelling Dynamic Transmitter Capsule', '1', 'MIC-1']
      ]
    }
  },
  {
    id: 't41_p4',
    manualId: 'tech-4-1',
    pageNumber: 52,
    sectionTitle: 'VOLUME 1: COMPONENT CODE CATALOG',
    subTitle: '1.4 Binding Terminals and Screws',
    paragraphs: [
      'Mechanical terminal blocks and chassis screw spares:'
    ],
    table: {
      headers: ['Part Number', 'Item Code', 'Component Description', 'Unit Qty', 'Reference'],
      rows: [
        ['EC-TE-10', '5940-01-230-1122', 'Spring Loaded Binding Terminal (Red)', '1', 'L1'],
        ['EC-TE-11', '5940-01-230-1123', 'Spring Loaded Binding Terminal (Black)', '1', 'L2'],
        ['EC-TE-12', '5940-01-230-1124', 'Ground Binding Terminal (Green)', '1', 'GND Post'],
        ['EC-SC-88', '5305-01-230-4499', 'Slotted Captured Faceplate Mounting Screw', '4', 'Faceplate Screws'],
        ['EC-OR-33', '5331-01-231-1002', 'Neoprene Main Case O-ring Seal', '1', 'Seal Gasket']
      ]
    }
  },
  {
    id: 't41_p5',
    manualId: 'tech-4-1',
    pageNumber: 53,
    sectionTitle: 'VOLUME 1: COMPONENT CODE CATALOG',
    subTitle: '1.5 Keypad Diagnostic Attachment Parts',
    paragraphs: [
      'Keypad and cord diagnostic components.'
    ],
    table: {
      headers: ['Part Number', 'Item Code', 'Component Description', 'Unit Qty', 'Reference'],
      rows: [
        ['EC-KP-90', '5805-01-240-3311', 'Auxiliary DTMF Keypad (Waterproof IP67)', '1', 'DTMF Pad'],
        ['EC-CO-12', '5995-01-240-3312', 'Keypad Spiral Coiled Cord 7-pin plug', '1', 'Keypad Line'],
        ['EC-SC-10', '5305-01-240-3320', 'Battery Door Capture Thumb Screw', '2', 'Battery Door']
      ]
    }
  },
  {
    id: 't41_p6',
    manualId: 'tech-4-1',
    pageNumber: 54,
    sectionTitle: 'VOLUME 1: COMPONENT CODE CATALOG',
    subTitle: '1.6 Transport Accessories and Overpack',
    paragraphs: [
      'Nylon straps, canvas carrying bags, and storage items.'
    ],
    table: {
      headers: ['Part Number', 'Item Code', 'Component Description', 'Unit Qty', 'Reference'],
      rows: [
        ['EC-ST-50', '5340-01-250-9821', 'Heavy Duty Adjustable Nylon Strap', '1', 'Carrying Strap'],
        ['EC-CB-15', '5340-01-250-9822', 'Canvas Transit Case with Padding', '1', 'Field Holster'],
        ['EC-MK-01', '5180-01-250-9900', 'Basic Field Depot Maintenance Tool Kit', '1', 'Service Tools']
      ]
    }
  },

  // ==================== ILLUSTRATIONS PART 4 Vol 2 (Pages 55 to 60) ====================
  {
    id: 't42_p1',
    manualId: 'tech-4-2',
    pageNumber: 55,
    sectionTitle: 'VOLUME 2: PARTS ILLUSTRATIONS',
    subTitle: '2.1 Illustrated Handset Body Section',
    paragraphs: [
      'The handset H-1001/U design is shown exploded. Note the seating of the rubber ring seal around the mouthpiece caps to preserve dynamic capsule operation in extreme rain.'
    ],
    diagramType: 'handset'
  },
  {
    id: 't42_p2',
    manualId: 'tech-4-2',
    pageNumber: 56,
    sectionTitle: 'VOLUME 2: PARTS ILLUSTRATIONS',
    subTitle: '2.2 Dynamic Magneto Assembly',
    paragraphs: [
      'Physical outline of the AlNiCo magneto generator. The drawing indicates the dual support bearing plates, the armature spindle wire coil, and the centrifugal throw contact leaf arm mechanism.'
    ],
    diagramType: 'gears'
  },
  {
    id: 't42_p3',
    manualId: 'tech-4-2',
    pageNumber: 57,
    sectionTitle: 'VOLUME 2: PARTS ILLUSTRATIONS',
    subTitle: '2.3 Line Binding Terminals',
    paragraphs: [
      'The detailed physical layout of the red L1 wire terminal showing spring compression slot and gold contacts plate.'
    ],
    diagramType: 'terminal'
  },
  {
    id: 't42_p4',
    manualId: 'tech-4-2',
    pageNumber: 58,
    sectionTitle: 'VOLUME 2: PARTS ILLUSTRATIONS',
    subTitle: '2.4 Ringer Striker Hammer Bell',
    paragraphs: [
      'Drafting of the matching dual-bell physical chime structure, illustrating the central mounting column, dynamic clapper hammer, and bi-polar electromagnet wire coils.'
    ],
    diagramType: 'block'
  },
  {
    id: 't42_p5',
    manualId: 'tech-4-2',
    pageNumber: 59,
    sectionTitle: 'VOLUME 2: PARTS ILLUSTRATIONS',
    subTitle: '2.5 Mode Switch Layout',
    paragraphs: [
      'Isometric structural draft of the mode selector switch. The multi-wafer ceramic rotary deck connects either battery inputs (Magneto Mode) or lines currents directly (Auto Mode).'
    ],
    diagramType: 'isometric'
  },
  {
    id: 't42_p6',
    manualId: 'tech-4-2',
    pageNumber: 60,
    sectionTitle: 'VOLUME 2: PARTS ILLUSTRATIONS',
    subTitle: '2.6 Complete physical outline drafting',
    paragraphs: [
      'Three-view engineering drawing showing the external envelope of RFT1001 with closed protective cover lid, strap mount clips, folding magneto crank, and battery compartment.'
    ],
    diagramType: 'wiring'
  },

  // ==================== PRODUCT TREE (Pages 61 to 65) ====================
  {
    id: 'pt_p1',
    manualId: 'product-tree',
    pageNumber: 61,
    sectionTitle: 'MIL SPEC PRODUCT STRUCTURE TREE',
    subTitle: '3.1 High-Level Component Decomposition',
    paragraphs: [
      'The ELCOM RFT1001 Field Telephone Set system structure comprises four primary architectural packages. Each package breaks down further into dedicated items.'
    ],
    diagramType: 'tree'
  },
  {
    id: 'pt_p2',
    manualId: 'product-tree',
    pageNumber: 62,
    sectionTitle: 'MIL SPEC PRODUCT STRUCTURE TREE',
    subTitle: '3.2 Mechanical Housing breakdown',
    paragraphs: [
      'The Case package (Level 2) decomposes as:',
      '- LEVEL 2: Enclosure Base (polycarbonate composite), Protective Top Cover Lid, Hinged battery chamber hatch.',
      '- LEVEL 3: Neoprene gasket o-rings, Captive thumbscrews, Nylon strap brackets, Metal spring-hinges.'
    ],
    table: {
      headers: ['Hierarchy Code', 'Assembly Level', 'Subassembly Tag', 'Design Ref'],
      rows: [
        ['1.000', 'Level 1: System Unit', 'RFT1001 Master Set', 'ELCOM RFT1001'],
        ['1.100', 'Level 2: Assembly', 'Polycarbonate Outer Casing Package', 'Case Enclosure'],
        ['1.110', 'Level 3: Component', 'Molded Bottom Box Body', 'EC-MC-320'],
        ['1.120', 'Level 3: Component', 'Integrated Top Cover Shield', 'EC-LID-12'],
        ['1.130', 'Level 3: Component', 'Hinged Battery Tray Lid', 'EC-CO-10']
      ]
    }
  },
  {
    id: 'pt_p3',
    manualId: 'product-tree',
    pageNumber: 63,
    sectionTitle: 'MIL SPEC PRODUCT STRUCTURE TREE',
    subTitle: '3.3 Electrical & Switching breakdown',
    paragraphs: [
      'The Signal Processing and Control package separates as:',
      '- LEVEL 2: Electro-mechanical Magneto unit, Adjustable Polarized Ringer unit, Anti-sidetone hybrid module.',
      '- LEVEL 3: Multi-wound steel cores, AlNiCo stator rings, Brass balance gears, Dual-cup alloy bells.'
    ],
    table: {
      headers: ['Hierarchy Code', 'Assembly Level', 'Subassembly Tag', 'Design Ref'],
      rows: [
        ['1.200', 'Level 2: Assembly', 'Acoustic & Call Alert System', 'Ringer & Crank'],
        ['1.210', 'Level 3: Component', 'EM Bell chimes structure', 'EC-RG-500'],
        ['1.220', 'Level 3: Component', 'Hand Cranked AC Magneto unit', 'EC-MG-600'],
        ['1.230', 'Level 3: Component', 'Anti-sidetone Hybrid Module', 'EC-TX-101']
      ]
    }
  },
  {
    id: 'pt_p4',
    manualId: 'product-tree',
    pageNumber: 64,
    sectionTitle: 'MIL SPEC PRODUCT STRUCTURE TREE',
    subTitle: '3.4 Handset Transceiver breakdown',
    paragraphs: [
      'The Handset sub-assembly decomposes as:',
      '- LEVEL 2: H-1001/U Plastic housing assembly, dynamic capsules package, coiled interface line cord.',
      '- LEVEL 3: Transmitter dynamic piece, receiver dynamic coil, PTT paddle contacts, 5-pin waterproof plug.'
    ],
    table: {
      headers: ['Hierarchy Code', 'Assembly Level', 'Subassembly Tag', 'Design Ref'],
      rows: [
        ['1.300', 'Level 2: Assembly', 'Handset H-1001/U Transceiver', 'EC-HS-100'],
        ['1.310', 'Level 3: Component', 'Waterproof grip body', 'EC-HC-101'],
        ['1.320', 'Level 3: Component', 'Dynamic Speaker element', 'EC-RX-55'],
        ['1.330', 'Level 3: Component', 'Dynamic Mic microphone capsule', 'EC-TX-56'],
        ['1.340', 'Level 3: Component', 'PTT press-to-talk mechanical trigger', 'Handset Switch'],
        ['1.350', 'Level 3: Plug', 'NATO standard waterproof 5-pin plug', 'NATO Rec' ]
      ]
    }
  }
];
