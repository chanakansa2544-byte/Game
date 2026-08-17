let shopName = "";
let energy = 100;
let gold = 50;
let stars = 0;
let shields = 0;

let currentCaseNum = 1;
const maxCases = 6;

let currentCaseData = null;
let gamePool = [];

// ===============================
// ระบบป้องกันการสุ่มกด
// ===============================

let usedTools = new Set();
let evidenceFound = false;
let caseAnswered = false;
let toolCooldown = false;

let totalAttempts = 0;
let correctAttempts = 0;


// ===============================
// ข้อความเมื่อเครื่องมือไม่พบปัญหา
// ===============================

const normalToolMessages = {

    beep:
        "🔊 BEEP CODE: สถานะปกติ ไม่พบรหัสเสียงความผิดปกติ (POST Passed)",

    led:
        "💡 DEBUG LED: ลำดับบูตปกติ (CPU->DRAM->VGA->BOOT สถานะ PASS)",

    task:
        "📊 TASK MGR: ทรัพยากรระบบปกติ (CPU/RAM/Disk ไม่พบภาวะคอขวด)",

    hw:
        "🌡️ HW MONITOR: อุณหภูมิ < 65°C, แรงดันไฟ (12V/5V/3.3V) เสถียร"

};


// =====================================================
// คลังข้อสอบ 30 สถานการณ์
// =====================================================

const masterCasePool = [

    {
        symptom:
            "เปิดเครื่องติด พัดลมหมุน แต่ไม่มีภาพขึ้นจอ",

        tool: "beep",

        toolHint:
            "🔊 Beep Code: ดังยาว 1 สั้น 2",

        correct:
            "ถอด RAM ออกมาใช้ยางลบขัดทำความสะอาดหน้าสัมผัส",

        wrong: [
            "ตรวจสอบปลั๊กไฟและเปลี่ยน Power Supply ใหม่",
            "ฟอร์แมตฮาร์ดดิสก์และลงระบบปฏิบัติการใหม่",
            "ถอดซิงก์ระบายความร้อนเพื่อเปลี่ยนซิลิโคน CPU"
        ]
    },

    {
        symptom:
            "ใช้งานไปได้ 15 นาที เครื่องดับเอง พัดลมเสียงดัง",

        tool: "hw",

        toolHint:
            "🌡️ HWMonitor: CPU อุณหภูมิ 98°C",

        correct:
            "เช็ดซิลิโคนเก่าออกแล้วทำการทาซิลิโคน CPU ใหม่",

        wrong: [
            "ถอดการ์ดจอออกมาทำความสะอาดพัดลมระบายความร้อน",
            "ติดตั้งโปรแกรมแอนตี้ไวรัสและทำการ Full Scan",
            "เพิ่มความจุ RAM เพื่อลดภาระการทำงานของเครื่อง"
        ]
    },

    {
        symptom:
            "เปิดเครื่องติด แต่ไฟ Debug LED ค้างที่คำว่า BOOT",

        tool: "led",

        toolHint:
            "💡 Debug LED: ค้างที่ BOOT",

        correct:
            "เข้าไปตั้งค่าลำดับการบูต (Boot Order) ใน BIOS",

        wrong: [
            "ตรวจสอบสาย LAN ว่าเชื่อมต่อกับเครือข่ายแน่นหรือไม่",
            "ถอด RAM ออกมาทำความสะอาดและใส่กลับเข้าไปใหม่",
            "ถอดถ่าน BIOS ทิ้งไว้ 5 นาทีเพื่อรีเซ็ตค่ากลับคืน"
        ]
    },

    {
        symptom:
            "เครื่องกระตุกมาก เปิดโปรแกรมช้า แฮงก์บ่อย",

        tool: "task",

        toolHint:
            "📊 Task Manager: Disk ทำงาน 100%",

        correct:
            "เปลี่ยนฮาร์ดดิสก์หลักจากแบบ HDD เป็นแบบ SSD",

        wrong: [
            "เปลี่ยนสายสัญญาณจอภาพใหม่เพื่อลดอาการกระตุก",
            "ดาวน์โหลดและอัปเดตไดรเวอร์การ์ดจอเวอร์ชันล่าสุด",
            "ถอด RAM ทั้งหมดออกมาใช้ยางลบขัดหน้าสัมผัสทองเหลือง"
        ]
    },

    {
        symptom:
            "เปิดไม่ติดเลย พัดลมไม่หมุน ไฟไม่เข้าเมนบอร์ด",

        tool: "hw",

        toolHint:
            "🔌 เช็กสายไฟ: ปลั๊กเสียบแน่นปกติ ไม่มีไฟรั่ว",

        correct:
            "ทำการเปลี่ยน Power Supply (PSU) ตัวใหม่ทดแทน",

        wrong: [
            "เปลี่ยนถ่าน BIOS บนเมนบอร์ดเนื่องจากแบตเตอรี่หมด",
            "ถอด RAM ออกมาทำความสะอาดเพื่อแก้ปัญหาไฟไม่เข้า",
            "ถอดซิงก์ระบายความร้อนเพื่อทาซิลิโคน CPU ใหม่"
        ]
    },

    {
        symptom:
            "เล่นเกมภาพแตกเป็นเส้นๆ (Artifact) แล้วค้าง",

        tool: "led",

        toolHint:
            "💡 Debug LED: ค้างที่ VGA",

        correct:
            "ถอดการ์ดจอออกมาตรวจสอบ หรือส่งเคลมศูนย์บริการ",

        wrong: [
            "ทำการลงระบบปฏิบัติการ Windows ใหม่เพื่อล้างไวรัส",
            "อัปเกรด CPU ให้มีประสิทธิภาพสูงขึ้นเพื่อลดคอขวด",
            "ถอด RAM สลับสล็อตการติดตั้งเพื่อแก้ปัญหาจอภาพ"
        ]
    },

    {
        symptom:
            "ต่อสาย LAN แล้วแต่เน็ตไม่มา ขึ้นรูปกากบาทสีแดง",

        tool: "hw",

        toolHint:
            "🔌 Cable Tester: ไฟติดไม่ครบ 8 เส้น",

        correct:
            "ทำการเข้าหัวสาย LAN ใหม่ หรือเปลี่ยนสาย LAN ใหม่",

        wrong: [
            "เข้าไปรีเซ็ตค่าเครือข่ายและการบูตในหน้า BIOS ใหม่",
            "ลงไดรเวอร์ Network ใหม่ และอัปเดตระบบปฏิบัติการ",
            "เปลี่ยน Power Supply เพราะจ่ายไฟให้การ์ดแลนไม่พอ"
        ]
    },

    {
        symptom:
            "เปิดเครื่องเจอจอฟ้า (BSOD) รหัส Memory Management",

        tool: "beep",

        toolHint:
            "🔊 Beep Code: เสียงดังสั้น 3 ครั้ง",

        correct:
            "สลับแถว RAM เพื่อทดสอบ หรือเปลี่ยน RAM แถวที่เสีย",

        wrong: [
            "ทำความสะอาดพัดลมระบายความร้อนและทาซิลิโคน CPU",
            "เข้า Safe Mode เพื่อถอนการติดตั้งไดรเวอร์การ์ดจอ",
            "ทำการฟอร์แมตฮาร์ดดิสก์และลง Windows ใหม่ทั้งหมด"
        ]
    },

    {
        symptom:
            "เครื่องส่งเสียงร้องเตือนต่อเนื่องไม่หยุดเมื่อกดปุ่มเปิด",

        tool: "beep",

        toolHint:
            "🔊 Beep Code: ดังยาวต่อเนื่องไม่หยุด",

        correct:
            "ตรวจสอบการติดตั้ง RAM ว่าเสียบลงสล็อตแน่นสนิทหรือไม่",

        wrong: [
            "เปลี่ยนแบตเตอรี่ CMOS บนเมนบอร์ดเนื่องจากไฟหมด",
            "เปลี่ยนสายสัญญาณเชื่อมต่อระหว่างจอภาพและตัวเครื่อง",
            "เคลียร์ฝุ่นบริเวณพัดลมระบายความร้อนของการ์ดจอ"
        ]
    },

    {
        symptom:
            "Windows มองเห็น RAM เพียงครึ่งเดียวจากที่ติดตั้งไว้",

        tool: "task",

        toolHint:
            "📊 Task Manager: Hardware Reserved กินพื้นที่ RAM สูงมาก",

        correct:
            "ถอด RAM ทั้งหมดมาทำความสะอาดและใส่กลับให้ถูก Dual Channel",

        wrong: [
            "เข้าไปอัปเดตไดรเวอร์ของการ์ดจอให้เป็นเวอร์ชันล่าสุด",
            "ใช้โปรแกรมสแกนไวรัสแบบ Full Scan เพื่อลบมัลแวร์",
            "เปลี่ยน Power Supply เพราะจ่ายไฟให้เมนบอร์ดไม่พอ"
        ]
    },

    {
        symptom:
            "เล่นเกมแล้วเฟรมเรตตกฮวบ เครื่องหน่วงผิดปกติ",

        tool: "task",

        toolHint:
            "📊 Task Manager: CPU วิ่งที่ 0.8 GHz ตลอดเวลา",

        correct:
            "ตรวจสอบชุดระบายความร้อน CPU ว่าประกบแนบสนิทหรือไม่",

        wrong: [
            "เปลี่ยนสาย LAN เป็นสาย Cat6 เพื่อเพิ่มความเร็วเน็ต",
            "ถอดการ์ดจอส่งเคลมศูนย์บริการเนื่องจากชิปประมวลผลพัง",
            "ปรับความละเอียดจอภาพให้ลดลงเพื่อลดการทำงานฮาร์ดดิสก์"
        ]
    },

    {
        symptom:
            "เปิดเครื่องปุ๊บ พัดลม CPU หมุนกระตุกแล้วดับทันที",

        tool: "led",

        toolHint:
            "💡 Debug LED: ไฟ CPU กะพริบสั้นๆ แล้วดับ",

        correct:
            "ตรวจสอบสายไฟเลี้ยง CPU (4-pin/8-pin) ว่าเสียบแน่นหรือไม่",

        wrong: [
            "เข้าไปตั้งค่าลำดับการบูต (Boot Order) ในหน้าต่าง BIOS",
            "ใช้ยางลบขัดหน้าสัมผัสทองเหลืองของการ์ดแสดงผล (VGA)",
            "เปลี่ยนฮาร์ดดิสก์เป็น SSD เพราะอ่านข้อมูลระบบไม่ทัน"
        ]
    },

    {
        symptom:
            "หน้าจอมืดสนิท แต่มีเสียงเข้า Windows และพิมพ์งานได้",

        tool: "hw",

        toolHint:
            "🔌 ตรวจสอบกายภาพ: สายไฟเลี้ยงการ์ดจอเสียบครบ จอเปิดติด",

        correct:
            "ตรวจสอบสายสัญญาณ (HDMI/DP) และสลับช่องเสียบจอภาพ",

        wrong: [
            "ถอดซิงก์ระบายความร้อนเพื่อทาซิลิโคน CPU ใหม่ทันที",
            "เข้าไปปรับค่า Boot Order ใน BIOS ให้เลือกบูตจาก SSD",
            "เปลี่ยน Power Supply เพราะจ่ายไฟให้ระบบไม่เพียงพอ"
        ]
    },

    {
        symptom:
            "เครื่องเปิดติด ภาพขึ้น แต่ความละเอียดหน้าจอล็อกไว้ต่ำมาก",

        tool: "task",

        toolHint:
            "📊 Task Manager: มองไม่เห็นชื่อรุ่นการ์ดจอในแท็บ Performance",

        correct:
            "ดาวน์โหลดและติดตั้งไดรเวอร์การ์ดจอเวอร์ชันล่าสุดให้ตรงรุ่น",

        wrong: [
            "ถอด RAM ออกมาขัดหน้าสัมผัสด้วยยางลบแล้วใส่กลับเข้าที่",
            "อัปเดตระบบปฏิบัติการ Windows เพื่อซ่อมแซมไฟล์ระบบ Boot",
            "เปลี่ยนหน้าจอคอมพิวเตอร์ใหม่เนื่องจากจอหมดอายุการใช้งาน"
        ]
    },

    {
        symptom:
            "เปิดเครื่องมาเจอข้อความ No Bootable Device Found",

        tool: "led",

        toolHint:
            "💡 Debug LED: ค้างที่ไฟ BOOT",

        correct:
            "เข้าไปตรวจสอบสถานะฮาร์ดดิสก์และตั้งค่า Boot Order ใน BIOS",

        wrong: [
            "ทำการเข้าหัวสาย LAN ใหม่ด้วยคีมย้ำสายเพื่อรับสัญญาณเน็ต",
            "ถอดการ์ดจอออกแล้วใช้การ์ดจอออนบอร์ดเพื่อทดสอบภาพ",
            "เปลี่ยนแบตเตอรี่ CMOS เพื่อแก้ปัญหาเวลาของเครื่องเดินไม่ตรง"
        ]
    },

    {
        symptom:
            "มีเสียงดังคลิกๆ แก๊กๆ ออกมาจากภายในเคสคอมพิวเตอร์",

        tool: "hw",

        toolHint:
            "🪛 ตรวจสอบกายภาพ: เสียงดังมาจากบริเวณช่องใส่ฮาร์ดดิสก์ HDD",

        correct:
            "สำรองข้อมูลด่วนและเตรียมตัวเปลี่ยนฮาร์ดดิสก์ลูกใหม่",

        wrong: [
            "ทำการเป่าฝุ่นและหยอดน้ำมันหล่อลื่นที่พัดลมของ Power Supply",
            "ทำความสะอาดหน้าสัมผัส RAM ด้วยน้ำยา Contact Cleaner",
            "อัปเดตซอฟต์แวร์ BIOS ของเมนบอร์ดให้เป็นเวอร์ชันล่าสุด"
        ]
    },

    {
        symptom:
            "เวลาและวันที่ของคอมพิวเตอร์รีเซ็ตใหม่ทุกครั้งที่เปิดเครื่อง",

        tool: "hw",

        toolHint:
            "🪛 ตรวจสอบกายภาพ: ตัวถ่านกระดุมบนเมนบอร์ดมีคราบออกไซด์",

        correct:
            "ซื้อแบตเตอรี่ CMOS (CR2032) ก้อนใหม่มาเปลี่ยนบนเมนบอร์ด",

        wrong: [
            "ปรับการตั้งค่า Time Zone ใน Windows ให้เป็น +07:00 Bangkok",
            "ลงระบบปฏิบัติการ Windows ใหม่เพื่อแก้ปัญหาไฟล์ Registry เสีย",
            "เข้าไปอัปเดตเฟิร์มแวร์ของ SSD ให้รองรับการบันทึกเวลา"
        ]
    },

    {
        symptom:
            "เล่นเกมกราฟิกสูงแล้วเครื่องดับวูบไปเลยทันที",

        tool: "hw",

        toolHint:
            "🌡️ HWMonitor: อุณหภูมิ CPU และ GPU ปกติ ไม่เกิน 75°C",

        correct:
            "เปลี่ยน Power Supply ที่มีกำลังวัตต์ (Watt) สูงขึ้นให้พอกับระบบ",

        wrong: [
            "เพิ่มพัดลมระบายความร้อนในเคสเพื่อไล่อากาศร้อนออกไป",
            "เข้าไปตั้งค่า Task Manager เพื่อลดการใช้ทรัพยากรพื้นหลัง",
            "ถอด RAM แถวที่ 2 ออกเพื่อลดการกินกระแสไฟของระบบ"
        ]
    },

    {
        symptom:
            "ไอคอน Wi-Fi หายไปจากแถบ Taskbar มุมขวาล่าง",

        tool: "task",

        toolHint:
            "📊 Device Manager: มีเครื่องหมายตกใจสีเหลืองที่ Network Adapter",

        correct:
            "คลิกขวาเลือก Update Driver หรือลงไดรเวอร์ Wi-Fi ใหม่",

        wrong: [
            "เปลี่ยนสายสัญญาณจอภาพและเช็กความละเอียดหน้าจอ",
            "ทำการ Clear CMOS เพื่อรีเซ็ตเมนบอร์ดให้เป็นค่าโรงงาน",
            "เปลี่ยนรหัสผ่านของเราเตอร์ Wi-Fi เพื่อป้องกันการโดนแฮก"
        ]
    },

    {
        symptom:
            "เข้าเว็บไซต์บางเว็บได้ แต่บางเว็บขึ้น Error โหลดไม่ขึ้น",

        tool: "task",

        toolHint:
            "📊 ตรวจสอบ Command Prompt: ปิงหา 8.8.8.8 เจอปกติ",

        correct:
            "ตรวจสอบการตั้งค่า DNS Server หรือรีสตาร์ทเราเตอร์อินเทอร์เน็ต",

        wrong: [
            "ถอดฮาร์ดดิสก์ไปสแกนหาไวรัสกับคอมพิวเตอร์เครื่องอื่น",
            "เป่าฝุ่นทำความสะอาดช่องเสียบสาย LAN บนตัวเมนบอร์ด",
            "เพิ่มจำนวน RAM เพื่อให้เบราว์เซอร์มีพื้นที่โหลดหน้าเว็บ"
        ]
    },

    {
        symptom:
            "เครื่องมีโฆษณาเด้งขึ้นมาเองที่มุมจอตลอดเวลา",

        tool: "task",

        toolHint:
            "📊 Task Manager: พบโปรแกรมชื่อแปลกๆ กิน CPU สูงในแท็บ Startup",

        correct:
            "ปิดโปรแกรมต้องสงสัยในแท็บ Startup และสแกนหา Malware",

        wrong: [
            "ฟอร์แมตฮาร์ดดิสก์ทิ้งทันทีเพื่อป้องกันไวรัสกระจายตัว",
            "ถอดซิงก์ CPU ออกมาทำความสะอาดเพื่อลดความร้อน",
            "เปลี่ยนสายสัญญาณอินเทอร์เน็ตเพื่อตัดการเชื่อมต่อจากแฮกเกอร์"
        ]
    },

    {
        symptom:
            "เปิดคอมพิวเตอร์ขึ้นมาเจอหน้าจอให้โอนเงินค่าไถ่ข้อมูล",

        tool: "task",

        toolHint:
            "📊 สถานการณ์: ข้อมูลในเครื่องถูกเปลี่ยนนามสกุลเป็นแปลกๆ (Ransomware)",

        correct:
            "ตัดการเชื่อมต่อเครือข่ายทันที และเตรียมตัวลงระบบปฏิบัติการใหม่",

        wrong: [
            "ทำการทาซิลิโคน CPU ใหม่เพื่อให้เครื่องประมวลผลถอดรหัสได้ไวขึ้น",
            "รีบโอนเงินตามที่แฮกเกอร์เรียกร้องเพื่อความปลอดภัยของข้อมูล",
            "ใช้ยางลบขัดหน้าสัมผัส RAM และสลับช่องเสียบเพื่อรีเซ็ตระบบ"
        ]
    },

    {
        symptom:
            "เสียบแฟลชไดรฟ์ที่ช่อง USB หน้าเคสแล้วไม่อ่าน",

        tool: "hw",

        toolHint:
            "🪛 ตรวจสอบกายภาพ: เสียบด้านหลังเมนบอร์ดอ่านข้อมูลได้ปกติ",

        correct:
            "เปิดฝาเคสตรวจสอบสาย Front Panel USB ว่าเสียบลงเมนบอร์ดแน่นไหม",

        wrong: [
            "อัปเดตระบบปฏิบัติการ Windows ให้รองรับพอร์ต USB 3.0",
            "เปลี่ยน Power Supply ตัวใหม่เพื่อให้จ่ายไฟไปหน้าเคสได้พอ",
            "โยนแฟลชไดรฟ์ทิ้งเพราะเกิดอาการไฟฟ้าสถิตจนชิปพังแล้ว"
        ]
    },

    {
        symptom:
            "เสียบหูฟังที่ช่องหน้าเคสแล้วไม่มีเสียงออก",

        tool: "task",

        toolHint:
            "📊 Sound Settings: ระบบเลือก Output เป็นหน้าจอผ่านสาย HDMI อยู่",

        correct:
            "คลิกที่ไอคอนลำโพง แล้วเปลี่ยน Playback Device ให้เป็นช่องหูฟัง",

        wrong: [
            "ซื้อการ์ดเสียง (Sound Card) แบบแยกมาติดตั้งเพิ่มเติม",
            "แกะเคสออกมาตรวจสอบสายสัญญาณภาพว่าเสียบแน่นหรือไม่",
            "เปลี่ยนไดรเวอร์การ์ดจอให้เป็นเวอร์ชันเก่าเพื่อแก้ปัญหาเสียง"
        ]
    },

    {
        symptom:
            "คอมพิวเตอร์ทำงานปกติ แต่ไฟ RGB ที่พัดลมเคสไม่ติด",

        tool: "hw",

        toolHint:
            "🪛 ตรวจสอบกายภาพ: พัดลมหมุนปกติ แต่สายไฟเส้นเล็กๆ หลุดอยู่",

        correct:
            "ตรวจสอบสาย ARGB 5V หรือ 12V RGB ว่าเสียบลงกล่องคอนโทรลเลอร์หรือไม่",

        wrong: [
            "เปลี่ยน Power Supply เพราะไฟไม่พอเลี้ยงระบบแสงสว่าง",
            "อัปเดต BIOS เพื่อปลดล็อกฟีเจอร์แสงไฟสเปกตรัม",
            "ถอดพัดลมไปล้างน้ำทำความสะอาดแผงวงจรควบคุมไฟ"
        ]
    },

    {
        symptom:
            "ประกอบคอมใหม่ เปิดติด แต่ไฟ Debug LED ค้างที่ CPU และ RAM สลับกัน",

        tool: "hw",

        toolHint:
            "🪛 ตรวจสอบกายภาพ: พบรอยงอที่ขา Socket ของเมนบอร์ดบริเวณใกล้ๆ CPU",

        correct:
            "ส่งเคลมเมนบอร์ด หรือใช้เข็มเขี่ยดัดขา Socket กลับมาอย่างระมัดระวัง",

        wrong: [
            "เข้าไปปรับความเร็วรอบพัดลม CPU ใน BIOS ให้หมุนเต็ม 100%",
            "ใช้ยางลบขัดหน้าสัมผัส CPU และ RAM อย่างรุนแรงเพื่อขจัดคราบ",
            "ดาวน์โหลดไดรเวอร์เมนบอร์ดมาติดตั้งผ่านทางแฟลชไดรฟ์"
        ]
    },

    {
        symptom:
            "กดเปิดเครื่อง พัดลมกระตุก 1 วินาทีแล้วนิ่ง ไฟไม่เข้าอีกเลย",

        tool: "hw",

        toolHint:
            "🔌 เช็กสายไฟ: เมื่อถอดสายไฟเลี้ยงการ์ดจอออก เครื่องเปิดติดปกติ",

        correct:
            "ภาคจ่ายไฟของการ์ดจอช็อต ต้องส่งซ่อมวงจรการ์ดแสดงผล",

        wrong: [
            "Power Supply เสียหายอย่างหนัก ต้องซื้อเปลี่ยนใหม่ทันที",
            "ถ่าน BIOS หมดอายุการใช้งาน ทำให้วงจรเริ่มการบูตล้มเหลว",
            "แรมเกิดไฟฟ้าสถิต ต้องถอดมาขัดและสลับช่องเสียบใหม่"
        ]
    },

    {
        symptom:
            "เครื่องค้าง (Freeze) ขยับเมาส์ไม่ได้ ต้องกดปุ่ม Power แช่เพื่อปิด",

        tool: "task",

        toolHint:
            "📊 Event Viewer: พบข้อความ Kernel-Power Error 41",

        correct:
            "ตรวจสอบสภาพ Power Supply และตั้งค่าปิด Fast Startup ใน Windows",

        wrong: [
            "เปลี่ยนสายสัญญาณภาพ (HDMI) เป็นสาย DisplayPort แทน",
            "เข้าเซฟโหมดเพื่อทำการลบไดรเวอร์เสียง (Audio) ออกทั้งหมด",
            "เป่าฝุ่นฮาร์ดดิสก์และขยับสาย SATA ให้แน่นหนายิ่งขึ้น"
        ]
    },

    {
        symptom:
            "เวลาใช้งานโปรแกรมหนักๆ จอจะดับไป 2 วินาทีแล้วติดขึ้นมาใหม่",

        tool: "hw",

        toolHint:
            "🌡️ HWMonitor: อุณหภูมิการ์ดจอปกติ แต่สายอแดปเตอร์จอภาพร้อนมาก",

        correct:
            "เปลี่ยนอแดปเตอร์หรือสายไฟของจอภาพ (Monitor Power Adapter)",

        wrong: [
            "อัปเกรด RAM เพื่อให้รองรับการประมวลผลกราฟิกที่หนักขึ้น",
            "เปลี่ยนการ์ดจอตัวใหม่เนื่องจากชิป VRAM เสื่อมสภาพ",
            "ทาซิลิโคนระบายความร้อนบนชิปเซตของเมนบอร์ดใหม่"
        ]
    },

    {
        symptom:
            "เข้าหน้า BIOS ได้ปกติ แต่พอจะโหลดเข้า Windows เครื่องจะรีสตาร์ทเองเสมอ",

        tool: "led",

        toolHint:
            "💡 Debug LED: ไฟวิ่งผ่านครบ 4 ดวงปกติ แต่รีสตาร์ทวนลูป",

        correct:
            "ใช้ USB Bootable ทำการซ่อมแซม Windows (Startup Repair)",

        wrong: [
            "เปลี่ยน Power Supply เนื่องจากจ่ายไฟช่วงโหลดเข้าระบบไม่พอ",
            "สลับช่องเสียบ RAM เพื่อแก้ปัญหาคอขวดของการโอนถ่ายข้อมูล",
            "เคลียร์ CMOS เพื่อล้างรหัสผ่านและค่าโรงงานของเมนบอร์ด"
        ]
    }

];


// =====================================================
// Accuracy
// =====================================================

function getAccuracy() {

    if (totalAttempts === 0) {
        return 0;
    }

    return Math.round(
        (correctAttempts / totalAttempts) * 100
    );
}


// =====================================================
// Sync Leaderboard
// =====================================================

function syncLeaderboard() {

    if (
        typeof window.syncDataToServer !==
        "function"
    ) {
        return;
    }

    window.syncDataToServer(
        shopName,
        stars,
        gold,
        getAccuracy(),
        totalAttempts,
        correctAttempts
    );
}


// =====================================================
// Custom Alert
// =====================================================

let alertCallback = null;


window.showAlert = function(
    title,
    message,
    icon = "👨‍💻",
    callback = null
) {

    document
        .getElementById(
            "alert-title"
        )
        .innerText =
        title;


    document
        .getElementById(
            "alert-icon"
        )
        .innerText =
        icon;


    document
        .getElementById(
            "alert-message"
        )
        .innerHTML =
        message.replace(
            /\n/g,
            "<br>"
        );


    document
        .getElementById(
            "custom-alert"
        )
        .classList
        .remove(
            "hidden"
        );


    alertCallback =
        callback;
};


window.closeAlert = function() {

    document
        .getElementById(
            "custom-alert"
        )
        .classList
        .add(
            "hidden"
        );


    if (
        alertCallback
    ) {

        const callback =
            alertCallback;

        alertCallback =
            null;

        callback();
    }
};


// =====================================================
// Terminal
// =====================================================

function logCMD(
    msg,
    type = "normal"
) {

    const cmdBox =
        document
            .getElementById(
                "cmd-terminal"
            );


    if (!cmdBox) {
        return;
    }


    const line =
        document
            .createElement(
                "div"
            );


    line.className =
        "cmd-line";


    const time =
        new Date()
            .toLocaleTimeString(
                "th-TH",
                {
                    hour12:
                        false
                }
            );


    const prefix =
        `[${time}] root@DiagOS> `;


    if (
        type ===
        "error"
    ) {

        line.className +=
            " cmd-error";
    }


    if (
        type ===
        "success"
    ) {

        line.className +=
            " cmd-success";
    }


    if (
        type ===
        "warn"
    ) {

        line.className +=
            " cmd-warn";
    }


    line.innerText =
        prefix + msg;


    cmdBox.appendChild(
        line
    );


    cmdBox.scrollTop =
        cmdBox.scrollHeight;
}


// =====================================================
// สุ่มเคส
// =====================================================

function createGamePool() {

    return [
        ...masterCasePool
    ]

        .sort(
            () =>
                Math.random() -
                0.5
        )

        .slice(
            0,
            maxCases
        );
}


// =====================================================
// เริ่มเกม
// =====================================================

window.startGame = function() {

    const inputName =
        document
            .getElementById(
                "shop-name-input"
            )
            .value
            .trim();


    if (
        inputName.length <
        2
    ) {

        showAlert(
            "ข้อผิดพลาด",
            "กรุณาตั้งชื่อร้านให้มีความยาว 2 ตัวอักษรขึ้นไปครับ!",
            "⚠️"
        );

        return;
    }


    shopName =
        inputName;


    document
        .getElementById(
            "login-screen"
        )
        .classList
        .add(
            "hidden"
        );


    document
        .getElementById(
            "game-screen"
        )
        .classList
        .remove(
            "hidden"
        );


    gamePool =
        createGamePool();


    gold -= 10;


    updateUI();

    syncLeaderboard();


    logCMD(
        "SYSTEM INITIALIZED. WELCOME, TECH " +
        shopName.toUpperCase(),
        "success"
    );


    loadCase();
};


// =====================================================
// โหลดเคส
// =====================================================

function loadCase() {

    if (
        currentCaseNum >
        maxCases
    ) {

        showAlert(

            "รายงานการประเมินผล",

            `🎉 จบกะการทำงาน!

⭐ ดาวสะสม: ${stars}
🎯 Accuracy: ${getAccuracy()}%
✅ ตอบถูก: ${correctAttempts}
📝 ตอบทั้งหมด: ${totalAttempts}

เริ่มกะใหม่เพื่อสะสมคะแนนต่อ!`,

            "🏆",

            () => {

                currentCaseNum =
                    1;


                gamePool =
                    createGamePool();


                gold -= 10;


                syncLeaderboard();


                document
                    .getElementById(
                        "cmd-terminal"
                    )
                    .innerHTML =
                    "";


                logCMD(
                    "STARTING NEW SHIFT...",
                    "warn"
                );


                updateUI();

                renderCase();
            }
        );


        return;
    }


    renderCase();
}


// =====================================================
// สถานะการวิเคราะห์
// =====================================================

function ensureAnalysisStatus() {

    let status =
        document
            .getElementById(
                "analysis-status"
            );


    const actionDiv =
        document
            .getElementById(
                "action-buttons"
            );


    if (
        status ||
        !actionDiv
    ) {

        return status;
    }


    status =
        document
            .createElement(
                "div"
            );


    status.id =
        "analysis-status";


    status.style.margin =
        "0 0 12px";


    status.style.padding =
        "12px 14px";


    status.style.border =
        "1px solid #334155";


    status.style.borderRadius =
        "9px";


    status.style.background =
        "#0f172a";


    status.style.color =
        "#cbd5e1";


    status.style.fontSize =
        "12px";


    status.style.lineHeight =
        "1.7";


    actionDiv
        .parentNode
        .insertBefore(
            status,
            actionDiv
        );


    return status;
}


// =====================================================
// ปลดล็อกคำตอบ
// =====================================================

function canAnswerCurrentCase() {

    return (
        usedTools.size >= 2 &&
        evidenceFound === true &&
        caseAnswered === false
    );
}


function updateAnswerLockState() {

    const canAnswer =
        canAnswerCurrentCase();


    const buttons =
        document
            .querySelectorAll(
                ".answer-btn"
            );


    buttons.forEach(
        button => {

            if (
                button.dataset.aiRemoved ===
                "true"
            ) {

                button.disabled =
                    true;

                return;
            }


            button.disabled =
                !canAnswer;


            button.style.opacity =
                canAnswer
                    ? "1"
                    : "0.45";


            button.style.cursor =
                canAnswer
                    ? "pointer"
                    : "not-allowed";
        }
    );


    const status =
        ensureAnalysisStatus();


    if (!status) {
        return;
    }


    if (
        caseAnswered
    ) {

        status.innerHTML =
            "✅ เคสนี้ได้รับคำตอบแล้ว";

        return;
    }


    if (
        usedTools.size <
        2
    ) {

        status.innerHTML =
            `🔒 <b>คำตอบยังล็อก</b><br>
            ตรวจสอบอย่างน้อย 2 เครื่องมือก่อนตอบ
            (${usedTools.size}/2)`;

        return;
    }


    if (
        !evidenceFound
    ) {

        status.innerHTML =
            `🔎 ตรวจแล้ว ${usedTools.size} เครื่องมือ
            แต่ยังไม่พบหลักฐานผิดปกติ<br>
            <b>ต้องตรวจเพิ่มก่อนตัดสินใจ</b>`;

        return;
    }


    status.innerHTML =
        `🔓 <b>พบหลักฐานแล้ว</b><br>
        ตรวจแล้ว ${usedTools.size} เครื่องมือ
        สามารถเลือกวิธีแก้ไขได้ 1 ครั้ง`;
}


// =====================================================
// แสดงเคส
// =====================================================

function renderCase() {

    currentCaseData =
        gamePool[
            currentCaseNum -
            1
        ];


    // Reset ระบบวิเคราะห์
    usedTools =
        new Set();

    evidenceFound =
        false;

    caseAnswered =
        false;

    toolCooldown =
        false;


    document
        .getElementById(
            "case-title"
        )
        .innerText =
        `📋 เคสที่ ${currentCaseNum}/${maxCases} | วิเคราะห์ก่อนตอบ`;


    document
        .getElementById(
            "case-symptom"
        )
        .innerText =
        currentCaseData.symptom;


    const clueBox =
        document
            .getElementById(
                "clue-display"
            );


    clueBox.innerText =
        "🔒 คำตอบถูกล็อก — ตรวจอย่างน้อย 2 เครื่องมือ และค้นหาหลักฐานผิดปกติก่อน";


    clueBox.style.color =
        "#94a3b8";


    logCMD(
        "--------------------------------"
    );


    logCMD(
        `LOADING CASE ${currentCaseNum}...`
    );


    logCMD(
        `SYMPTOM: ${currentCaseData.symptom}`,
        "warn"
    );


    logCMD(
        "RULE: USE AT LEAST 2 DIFFERENT TOOLS BEFORE ANSWERING.",
        "warn"
    );


    const options = [

        currentCaseData.correct,

        ...currentCaseData.wrong

    ].sort(
        () =>
            Math.random() -
            0.5
    );


    const actionDiv =
        document
            .getElementById(
                "action-buttons"
            );


    actionDiv.innerHTML =
        "";


    options.forEach(
        option => {

            const button =
                document
                    .createElement(
                        "button"
                    );


            button.className =
                "btn btn-outline answer-btn";


            button.innerText =
                option;


            button.disabled =
                true;


            button.style.opacity =
                "0.45";


            button.style.cursor =
                "not-allowed";


            button.onclick =
                () =>
                    takeAction(
                        option,
                        button
                    );


            actionDiv.appendChild(
                button
            );
        }
    );


    updateAnswerLockState();

    updateUI();
}


// =====================================================
// ใช้เครื่องมือวิเคราะห์
// =====================================================

window.useTool = function(
    toolType
) {

    if (
        caseAnswered
    ) {

        logCMD(
            "CASE ALREADY CLOSED.",
            "warn"
        );

        return;
    }


    if (
        toolCooldown
    ) {

        logCMD(
            "WAIT: READ THE PREVIOUS RESULT BEFORE USING ANOTHER TOOL.",
            "warn"
        );

        return;
    }


    if (
        usedTools.has(
            toolType
        )
    ) {

        showAlert(
            "เครื่องมือนี้ตรวจแล้ว",
            "คุณใช้เครื่องมือนี้ไปแล้ว การกดซ้ำจะไม่ช่วยเพิ่มหลักฐาน กรุณาเลือกเครื่องมือชนิดอื่น",
            "🔎"
        );

        return;
    }


    if (
        energy <
        10
    ) {

        showAlert(
            "พลังงานไม่เพียงพอ",
            "พลังงานไม่พอสำหรับการตรวจ กรุณาใช้ Energy Drink",
            "🔋"
        );

        return;
    }


    toolCooldown =
        true;


    setTimeout(
        () => {

            toolCooldown =
                false;

        },

        900
    );


    energy -= 10;


    usedTools.add(
        toolType
    );


    logCMD(
        `EXECUTING TOOL: [${toolType.toUpperCase()}]...`
    );


    const clueBox =
        document
            .getElementById(
                "clue-display"
            );


    if (
        toolType ===
        currentCaseData.tool
    ) {

        evidenceFound =
            true;


        clueBox.innerText =
            currentCaseData.toolHint;


        clueBox.style.color =
            "#38bdf8";


        logCMD(
            `EVIDENCE FOUND: ${currentCaseData.toolHint}`,
            "success"
        );

    } else {

        const normalMsg =
            normalToolMessages[
                toolType
            ] ||
            "ระบบทำงานปกติ ไม่พบความผิดปกติ";


        clueBox.innerText =
            normalMsg;


        clueBox.style.color =
            "#94a3b8";


        logCMD(
            `NORMAL RESULT: ${normalMsg}`
        );
    }


    updateAnswerLockState();

    updateUI();
};


// =====================================================
// ตอบคำถาม
// =====================================================

function takeAction(
    selectedOpt,
    btnElement
) {

    if (
        caseAnswered
    ) {

        return;
    }


    if (
        !canAnswerCurrentCase()
    ) {

        showAlert(

            "ยังตอบไม่ได้",

            `กรุณาวิเคราะห์ก่อนตอบ

ต้องทำครบ:
• ใช้เครื่องมืออย่างน้อย 2 ชนิด
• พบหลักฐานผิดปกติ

ตอนนี้ตรวจแล้ว ${usedTools.size} เครื่องมือ`,

            "🔒"
        );

        return;
    }


    caseAnswered =
        true;


    totalAttempts++;


    document
        .querySelectorAll(
            ".answer-btn"
        )
        .forEach(
            button => {

                button.disabled =
                    true;

                button.style.cursor =
                    "default";
            }
        );


    logCMD(
        `FINAL DECISION: ${selectedOpt}`
    );


    // ===============================
    // ตอบถูก
    // ===============================

    if (
        selectedOpt ===
        currentCaseData.correct
    ) {

        correctAttempts++;

        stars++;

        gold += 50;


        btnElement
            .classList
            .replace(
                "btn-outline",
                "btn-success"
            );


        logCMD(
            "CORRECT DIAGNOSIS.",
            "success"
        );


        logCMD(
            `ACCURACY: ${getAccuracy()}%`,
            "success"
        );


        updateUI();

        syncLeaderboard();


        setTimeout(
            () => {

                currentCaseNum++;

                loadCase();

            },

            1000
        );


        return;
    }


    // ===============================
    // ตอบผิด
    // ===============================

    btnElement
        .classList
        .replace(
            "btn-outline",
            "btn-danger"
        );


    gold =
        Math.max(
            0,
            gold - 30
        );


    if (
        shields >
        0
    ) {

        shields--;


        logCMD(
            "INSURANCE SHIELD USED.",
            "warn"
        );

    } else {

        energy =
            Math.max(
                0,
                energy - 20
            );
    }


    logCMD(
        "INCORRECT DIAGNOSIS. CASE FAILED.",
        "error"
    );


    logCMD(
        `ACCURACY: ${getAccuracy()}%`,
        "warn"
    );


    updateUI();

    syncLeaderboard();


    const feedback =

        `❌ เคสนี้ตอบได้เพียง 1 ครั้ง

คุณจึงไม่สามารถสุ่มตอบข้ออื่นต่อได้

🔎 หลักฐานสำคัญ:
${currentCaseData.toolHint}

✅ วิธีแก้ที่เหมาะสม:
${currentCaseData.correct}

💸 ค่าความเสียหาย: -$30

🎯 Accuracy ปัจจุบัน:
${getAccuracy()}%`;


    showAlert(

        "วิเคราะห์ไม่ถูกต้อง",

        feedback,

        "❌",

        () => {

            if (
                energy <=
                0
            ) {

                energy =
                    100;


                logCMD(
                    "ENERGY RESTORED FOR NEXT CASE.",
                    "warn"
                );
            }


            currentCaseNum++;

            loadCase();
        }
    );
}


// =====================================================
// Update UI
// =====================================================

function updateUI() {

    document
        .getElementById(
            "display-shop-name"
        )
        .innerText =
        shopName;


    document
        .getElementById(
            "display-stars"
        )
        .innerText =
        stars;


    document
        .getElementById(
            "display-energy"
        )
        .innerText =
        energy;


    document
        .getElementById(
            "display-gold"
        )
        .innerText =
        gold;


    document
        .getElementById(
            "shop-gold"
        )
        .innerText =
        gold;


    document
        .getElementById(
            "display-shield"
        )
        .innerText =
        shields;


    // ===============================
    // Rank
    // ===============================

    let rank =
        "Bronze";


    if (
        stars >=
        50
    ) {

        rank =
            "Conqueror";

    } else if (
        stars >=
        30
    ) {

        rank =
            "Diamond";

    } else if (
        stars >=
        20
    ) {

        rank =
            "Platinum";

    } else if (
        stars >=
        15
    ) {

        rank =
            "Gold";

    } else if (
        stars >=
        10
    ) {

        rank =
            "Silver";
    }


    document
        .getElementById(
            "display-rank"
        )
        .innerText =
        rank;
}


// =====================================================
// ร้านค้า
// =====================================================

window.toggleShop = function() {

    const shop =
        document
            .getElementById(
                "shop-screen"
            );


    shop
        .classList
        .toggle(
            "hidden"
        );
};


// =====================================================
// ซื้อสินค้า
// =====================================================

window.buyItem = function(
    type,
    price,
    val
) {

    if (
        gold <
        price
    ) {

        showAlert(
            "ฝ่ายการเงิน",
            "เงินไม่พอเบิกอุปกรณ์ครับช่าง!",
            "💸"
        );

        return;
    }


    gold -=
        price;


    if (
        type ===
        "energy"
    ) {

        energy =
            Math.min(
                100,
                energy + val
            );


        logCMD(
            "ITEM PURCHASED: ENERGY DRINK",
            "success"
        );
    }


    if (
        type ===
        "shield"
    ) {

        shields++;


        logCMD(
            "ITEM PURCHASED: INSURANCE SHIELD",
            "success"
        );
    }


    if (
        type ===
        "ai"
    ) {

        logCMD(
            "AI DIAGNOSTIC APPLIED.",
            "warn"
        );


        const buttons =
            document
                .querySelectorAll(
                    ".answer-btn"
                );


        let removed =
            false;


        buttons.forEach(
            button => {

                if (
                    !removed &&
                    button.innerText !==
                    currentCaseData.correct
                ) {

                    button.style.display =
                        "none";


                    button.dataset.aiRemoved =
                        "true";


                    removed =
                        true;
                }
            }
        );


        toggleShop();
    }


    updateUI();

    syncLeaderboard();

    updateAnswerLockState();
};


// =====================================================
// ป้องกันคลิกขวา / F12
// =====================================================

document.addEventListener(

    "contextmenu",

    event =>
        event.preventDefault()

);


document.onkeydown =
    function(
        event
    ) {

        if (
            event.keyCode ===
            123
        ) {

            return false;
        }


        if (
            event.ctrlKey &&
            event.shiftKey &&
            (
                event.keyCode === 73 ||
                event.keyCode === 74 ||
                event.keyCode === 67
            )
        ) {

            return false;
        }


        if (
            event.ctrlKey &&
            event.keyCode ===
            85
        ) {

            return false;
        }
    };
